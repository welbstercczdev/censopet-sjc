// --- START OF FILE components/Toast.tsx ---
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string | null;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-brand-500'
  };

  const icons = {
    success: <CheckCircle size={20} className="text-white" />,
    error: <AlertCircle size={20} className="text-white" />,
    info: <AlertCircle size={20} className="text-white" />
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[70] animate-slide-down w-[90%] max-w-sm">
      <div className={`${bgColors[type]} rounded-xl shadow-lg p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {icons[type]}
          <p className="text-white font-medium text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;