import React, { useState, useEffect } from 'react';
import { AddressData } from '../types';
import { fetchAddressByCep } from '../services/cepService';
import { MapPin, Search, Loader2, WifiOff, RotateCcw } from 'lucide-react';

interface AddressFormProps {
  data: AddressData;
  onUpdate: (data: AddressData) => void;
  onNext: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ data, onUpdate, onNext }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
        setIsOffline(true);
        setManualMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check logic
    if (isOffline) {
        setManualMode(true);
    }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatCep = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substr(0, 9);
  };

  const handleChange = (field: keyof AddressData, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleClear = () => {
    onUpdate({
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        localidade: '',
        uf: ''
    });
    setManualMode(false);
    document.getElementById('cep')?.focus();
  };

  const handleCepBlur = async () => {
    const rawCep = data.cep.replace(/\D/g, '');
    if (rawCep.length !== 8) return;

    // Skip fetch if offline
    if (isOffline) {
        setManualMode(true);
        setError(null);
        return;
    }

    setLoading(true);
    setError(null);
    setManualMode(false);

    try {
      const result = await fetchAddressByCep(rawCep);
      if (result) {
        onUpdate({
          ...data,
          logradouro: result.logradouro,
          bairro: result.bairro,
          localidade: result.localidade,
          uf: result.uf
        });
        document.getElementById('numero')?.focus();
      } else {
        setError("CEP não encontrado. Preencha manualmente.");
        setManualMode(true);
        onUpdate({ ...data, logradouro: '', bairro: '' });
      }
    } catch (e) {
      // Graceful degradation for API errors
      setError("Não foi possível buscar o CEP. Preencha manualmente.");
      setManualMode(true);
    } finally {
      setLoading(false);
    }
  };

  const isValid = data.cep.length === 9 && data.logradouro.length > 0 && data.numero.length > 0 && data.bairro.length > 0;
  const hasData = data.cep || data.logradouro || data.bairro;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-4 relative">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300 mb-3">
          <MapPin size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Localização</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Informe os dados da residência</p>
        
        {isOffline && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium">
                <WifiOff size={12} className="mr-1.5" />
                Modo Offline Ativado
            </div>
        )}
      </div>

      {hasData && (
        <div className="flex justify-end">
            <button 
                onClick={handleClear}
                className="flex items-center text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors"
            >
                <RotateCcw size={14} className="mr-1" />
                Limpar endereço
            </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* CEP Field */}
        <div className="relative">
          <label htmlFor="cep" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            CEP <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="cep"
              value={data.cep}
              onChange={(e) => handleChange('cep', formatCep(e.target.value))}
              onBlur={handleCepBlur}
              placeholder="00000-000"
              maxLength={9}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              {loading ? <Loader2 size={20} className="animate-spin" /> : (!isOffline && <Search size={20} />)}
            </div>
          </div>
          {error && <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">{error}</p>}
        </div>

        {/* Logradouro */}
        <div>
          <label htmlFor="logradouro" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Logradouro <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="logradouro"
            value={data.logradouro}
            onChange={(e) => handleChange('logradouro', e.target.value)}
            disabled={!manualMode && data.logradouro.length > 0 && !loading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Numero */}
          <div>
            <label htmlFor="numero" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="numero"
              value={data.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
              placeholder="Ex: 123"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Bairro */}
          <div>
            <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bairro <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bairro"
              value={data.bairro}
              onChange={(e) => handleChange('bairro', e.target.value)}
              disabled={!manualMode && data.bairro.length > 0 && !loading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Complemento */}
        <div>
          <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Complemento <span className="text-gray-400 font-normal">(Opcional)</span>
          </label>
          <input
            type="text"
            id="complemento"
            value={data.complemento}
            onChange={(e) => handleChange('complemento', e.target.value)}
            placeholder="Ex: Apto 101, Fundos"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default AddressForm;