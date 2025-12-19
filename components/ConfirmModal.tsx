// --- START OF FILE components/ConfirmModal.tsx ---
import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // Se for true, o botão fica vermelho (perigo)
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-800 transform transition-all scale-100">
        
        <div className="p-6 text-center">
          <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-brand-100 text-brand-600'}`}>
            {isDestructive ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-white font-bold shadow-lg transition-transform transform active:scale-95 ${
                isDestructive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;