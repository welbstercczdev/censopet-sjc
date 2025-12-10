// --- START OF FILE components/SyncModal.tsx ---
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';
import LZString from 'lz-string';
import { X, Camera, QrCode, AlertTriangle, Copy } from 'lucide-react';
import { CensusRecord } from '../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataToExport: CensusRecord[]; // Dados para gerar o QR
  onImportData: (data: CensusRecord[]) => void; // Função quando ler um QR
}

const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose, dataToExport, onImportData }) => {
  const [mode, setMode] = useState<'export' | 'scan'>('export');
  const [qrError, setQrError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Lógica de Exportação (Gerar QR)
  const compressedData = React.useMemo(() => {
    if (!dataToExport || dataToExport.length === 0) return '';
    const jsonString = JSON.stringify(dataToExport);
    // Comprime para caber mais dados no QR Code
    return LZString.compressToEncodedURIComponent(jsonString);
  }, [dataToExport]);

  // Verifica se o dado é muito grande para um QR Code (limite seguro ~2000-2500 chars)
  const isTooBig = compressedData.length > 2200;

  // Lógica de Escaneamento (Câmera)
  useEffect(() => {
    if (isOpen && mode === 'scan' && !scannerRef.current) {
      // Pequeno delay para garantir que o modal renderizou
      const timer = setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        
        scanner.render((decodedText) => {
          try {
            // Tenta descomprimir
            let jsonString = LZString.decompressFromEncodedURIComponent(decodedText);
            
            // Se falhar a descompressão, tenta ler como JSON normal (caso não esteja comprimido)
            if (!jsonString) jsonString = decodedText;

            const parsedData = JSON.parse(jsonString);
            
            if (Array.isArray(parsedData)) {
              onImportData(parsedData);
              scanner.clear();
              onClose();
            } else {
              setScanError("QR Code lido, mas formato inválido.");
            }
          } catch (e) {
            console.error(e);
            setScanError("Erro ao processar dados do QR Code.");
          }
        }, (errorMessage) => {
          // Erros de leitura constantes (ignoramos para não poluir a UI)
        });

        scannerRef.current = scanner;
      }, 100);

      return () => clearTimeout(timer);
    }

    // Limpeza ao fechar ou mudar de modo
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isOpen, mode, onImportData, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <QrCode size={20} className="text-brand-500" />
            Sincronizar via QR Code
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
            Mostrar QR (Exportar)
          </button>
          <button
            onClick={() => setMode('scan')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'scan' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50 dark:bg-brand-900/20' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Ler Câmera (Importar)
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow flex flex-col items-center justify-center">
          
          {/* MODO EXPORTAR */}
          {mode === 'export' && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              {isTooBig ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white">Muitos dados!</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    A seleção atual ({dataToExport.length} registros) gera um QR Code muito complexo para ser lido com segurança.
                  </p>
                  <p className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    Tamanho: {compressedData.length} chars (Recomendado: &lt; 2200)
                  </p>
                  <div className="text-xs text-gray-400">
                    Dica: Tente exportar registros individuais ou usar a exportação por arquivo.
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 mb-4">
                    <QRCode 
                      value={compressedData} 
                      size={256}
                      level="L" // Baixa correção de erro para caber mais dados
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                    Aponte outro dispositivo com este aplicativo aberto na aba "Ler Câmera" para transferir <strong>{dataToExport.length}</strong> registro(s).
                  </p>
                </>
              )}
            </div>
          )}

          {/* MODO ESCANEAR */}
          {mode === 'scan' && (
            <div className="w-full flex flex-col items-center animate-fade-in">
               <div id="reader" className="w-full max-w-xs overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-black"></div>
               <p className="text-xs text-gray-500 mt-4 text-center">
                 Aponte para o QR Code gerado em outro dispositivo.
               </p>
               {scanError && (
                 <p className="text-red-500 text-sm mt-2 font-medium bg-red-50 p-2 rounded w-full text-center">
                   {scanError}
                 </p>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SyncModal;