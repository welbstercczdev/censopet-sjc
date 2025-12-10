import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detecta se já está instalado (modo standalone)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();
    window.addEventListener('resize', checkStandalone); // Monitora mudanças

    // 2. Detecta se é iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // 3. Captura o evento de instalação do Chrome/Android
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('resize', checkStandalone);
    };
  }, []);

  const handleInstallClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Cenário A: O navegador permite instalação automática (Android/Desktop)
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } 
    // Cenário B: iOS ou navegador que não suporta o evento automático
    else {
      setShowInstructions(true);
    }
  };

  // Se o app já estiver instalado, esconde o botão totalmente
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* O Botão Forçado (Sempre visível se não estiver instalado) */}
      <button
        onClick={handleInstallClick}
        className="p-2 mr-2 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
        title="Instalar Aplicativo"
      >
        <Download size={20} />
      </button>

      {/* Modal de Instruções (Aparece quando não dá pra instalar automático) */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 relative border border-gray-100 dark:border-gray-800">
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Instalar CensoPet
            </h3>

            {isIOS ? (
              // Instruções para iPhone (iOS)
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>O iOS não permite instalação automática. Siga os passos:</p>
                <ol className="space-y-3">
                  <li className="flex items-center gap-2">
                    1. Toque no botão <span className="font-bold">Compartilhar</span> 
                    <Share size={16} className="text-blue-500" />
                    na barra do navegador.
                  </li>
                  <li className="flex items-center gap-2">
                    2. Role para baixo e toque em <span className="font-bold">Adicionar à Tela de Início</span>
                    <PlusSquare size={16} className="text-gray-500" />.
                  </li>
                  <li>
                    3. Confirme clicando em <span className="font-bold">Adicionar</span>.
                  </li>
                </ol>
              </div>
            ) : (
              // Instruções Genéricas (Android antigo / Outros)
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>Para instalar este aplicativo:</p>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Toque no menu do navegador (três pontinhos).</li>
                  <li>Procure por <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                </ol>
              </div>
            )}
            
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-6 w-full py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;