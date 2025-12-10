// --- START OF FILE components/SyncModal.tsx ---
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Html5Qrcode } from 'html5-qrcode';
import LZString from 'lz-string';
import { X, QrCode, AlertTriangle, RefreshCw, Image as ImageIcon, Camera } from 'lucide-react';
import { CensusRecord } from '../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataToExport: CensusRecord[];
  onImportData: (data: CensusRecord[]) => void;
}

const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose, dataToExport, onImportData }) => {
  const [mode, setMode] = useState<'export' | 'scan'>('export');
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calcula QR Code
  const compressedData = React.useMemo(() => {
    if (!dataToExport || dataToExport.length === 0) return '';
    const jsonString = JSON.stringify(dataToExport);
    return LZString.compressToEncodedURIComponent(jsonString);
  }, [dataToExport]);

  const isTooBig = compressedData.length > 2200;

  // Processa dados lidos (seja por câmera ou arquivo)
  const processDecodedText = (decodedText: string) => {
    try {
      let jsonString = LZString.decompressFromEncodedURIComponent(decodedText);
      if (!jsonString) jsonString = decodedText;

      const parsedData = JSON.parse(jsonString);
      
      if (Array.isArray(parsedData)) {
        // Se estava escaneando, para a câmera
        if (scannerRef.current && isScanning) {
           scannerRef.current.stop().then(() => {
             scannerRef.current?.clear();
             onImportData(parsedData);
             onClose();
           }).catch(() => {
             // Força fechamento mesmo com erro
             onImportData(parsedData);
             onClose();
           });
        } else {
           onImportData(parsedData);
           onClose();
        }
      }
    } catch (e) {
      console.error(e);
      setScanError("QR Code inválido ou corrompido.");
    }
  };

  const startCamera = async () => {
    setScanError(null);
    setIsScanning(true);

    try {
      await new Promise(r => setTimeout(r, 100)); // Delay para render

      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch(e){}
        scannerRef.current.clear();
      }

      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => processDecodedText(decodedText),
        (errorMessage) => { /* ignora erros de frame */ }
      );
    } catch (err: any) {
      console.error("Erro Câmera:", err);
      setIsScanning(false);
      
      // Mensagens de erro amigáveis
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        setScanError("Permissão bloqueada pelo Android (Sobreposição de tela). Tente usar a opção 'Carregar Imagem' abaixo.");
      } else {
        setScanError("Não foi possível iniciar a câmera. Tente usar a opção 'Carregar Imagem'.");
      }
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  // Handler para Upload de Arquivo (Plano B)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    
    // Se a câmera estiver rodando, para ela antes
    if (isScanning) {
        await stopCamera();
    }

    try {
        const html5QrCode = new Html5Qrcode("reader");
        const result = await html5QrCode.scanFile(file, true);
        processDecodedText(result);
    } catch (err) {
        setScanError("Não foi possível encontrar um QR Code válido nesta imagem.");
    }
    
    // Limpa o input para permitir selecionar o mesmo arquivo novamente se falhar
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (isOpen && mode === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => { stopCamera(); };
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <QrCode size={20} className="text-brand-500" />
            Sincronizar
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setMode('export')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'export' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50 dark:bg-brand-900/20' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Meu QR Code
          </button>
          <button
            onClick={() => setMode('scan')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'scan' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50 dark:bg-brand-900/20' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Ler (Câmera/Foto)
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow flex flex-col items-center justify-center min-h-[350px]">
          
          {/* MODO EXPORTAR */}
          {mode === 'export' && (
            <div className="w-full flex flex-col items-center animate-fade-in text-center">
              {isTooBig ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white">Muitos dados!</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Selecione menos registros ou use a exportação por arquivo.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 mb-4">
                    <QRCode value={compressedData} size={220} level="L" viewBox={`0 0 256 256`} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aponte outro celular para este código para transferir <strong>{dataToExport.length}</strong> registro(s).
                  </p>
                </>
              )}
            </div>
          )}

          {/* MODO ESCANEAR */}
          {mode === 'scan' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative">
               
               {/* Área da Câmera */}
               <div className="relative w-full aspect-square max-w-[280px] bg-black rounded-2xl overflow-hidden shadow-inner border border-gray-700 mb-4">
                  <div id="reader" className="w-full h-full"></div>
                  
                  {!isScanning && !scanError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="animate-spin text-white" size={32} />
                    </div>
                  )}

                  {isScanning && !scanError && (
                    <div className="absolute inset-0 border-2 border-brand-500/50 m-8 rounded-lg pointer-events-none">
                       <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-500 -mt-0.5 -ml-0.5"></div>
                       <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-500 -mt-0.5 -mr-0.5"></div>
                       <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-500 -mb-0.5 -ml-0.5"></div>
                       <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-500 -mb-0.5 -mr-0.5"></div>
                    </div>
                  )}
               </div>

               {/* Mensagem de Erro */}
               {scanError && (
                 <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-center w-full">
                   <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Problema com a Câmera</p>
                   <p className="text-xs text-gray-600 dark:text-gray-300">{scanError}</p>
                 </div>
               )}

               {/* Botão de Upload de Arquivo (Plano B) */}
               <div className="w-full">
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ImageIcon size={20} />
                    {scanError ? "Carregar Foto do QR Code" : "Ou carregue uma imagem"}
                  </button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SyncModal;