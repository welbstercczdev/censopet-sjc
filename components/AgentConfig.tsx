import React, { useState, useEffect } from 'react';
import { User, IdCard, Save, X } from 'lucide-react';
import { AgentInfo } from '../types';

interface AgentConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (info: AgentInfo) => void;
  initialData: AgentInfo | null;
}

const AgentConfig: React.FC<AgentConfigProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setId(initialData.id);
    } else if (isOpen && !initialData) {
      setName('');
      setId('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && id.trim()) {
      onSave({ name: name.trim(), id: id.trim() });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-800 transform transition-all scale-100">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User size={20} className="text-brand-500" />
            Identificação do Agente
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Essas informações serão usadas para nomear os arquivos de exportação.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome Completo
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
              <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Matrícula / ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Ex: 12345-X"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
              <IdCard className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            <Save size={18} />
            Salvar Identificação
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentConfig;