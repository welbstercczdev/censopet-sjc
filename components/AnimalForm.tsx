import React, { useState } from 'react';
import { CensusFormData } from '../types';
import { PawPrint, Dog, Cat, ArrowLeft, AlertCircle, Syringe } from 'lucide-react';

interface AnimalFormProps {
  data: CensusFormData;
  onUpdate: (data: CensusFormData) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const AnimalForm: React.FC<AnimalFormProps> = ({ data, onUpdate, onBack, onSubmit }) => {
  const [hasAnimalsState, setHasAnimalsState] = useState<boolean | null>(
    data.possuiAnimais ? true : (data.possuiAnimais === false && data.endereco.cep ? false : null)
  ); 
  
  // Validação local para erros de consistência
  const [errors, setErrors] = useState<{ dogs?: string; cats?: string }>({});

  const handleHasAnimalsChange = (value: boolean) => {
    setHasAnimalsState(value);
    onUpdate({
      ...data,
      possuiAnimais: value,
      dadosAnimais: value ? data.dadosAnimais : {
        cachorros: { possui: false, total: 0, castrados: 0, naoCastrados: 0, vacinados: 0, naoVacinados: 0 },
        gatos: { possui: false, total: 0, castrados: 0, naoCastrados: 0, vacinados: 0, naoVacinados: 0 }
      }
    });
  };

  const handleSpeciesToggle = (species: 'cachorros' | 'gatos', checked: boolean) => {
    onUpdate({
      ...data,
      dadosAnimais: {
        ...data.dadosAnimais,
        [species]: {
          ...data.dadosAnimais[species],
          possui: checked,
          total: checked ? data.dadosAnimais[species].total : 0,
          castrados: checked ? data.dadosAnimais[species].castrados : 0,
          naoCastrados: 0,
          vacinados: checked ? data.dadosAnimais[species].vacinados : 0, // Reset vacinados
          naoVacinados: 0
        }
      }
    });
  };

  const handleNumberChange = (species: 'cachorros' | 'gatos', field: 'total' | 'castrados' | 'vacinados', value: string) => {
    const numValue = parseInt(value) || 0;
    const currentData = data.dadosAnimais[species];
    
    // Calcula os novos valores potenciais
    const newTotal = field === 'total' ? numValue : currentData.total;
    const newCastrados = field === 'castrados' ? numValue : currentData.castrados;
    const newVacinados = field === 'vacinados' ? numValue : currentData.vacinados;

    // Lógica de Validação
    let errorMsg = undefined;
    if (newCastrados > newTotal) {
      errorMsg = "Castrados não pode ser maior que o total.";
    } else if (newVacinados > newTotal) {
      errorMsg = "Vacinados não pode ser maior que o total.";
    }

    setErrors(prev => ({ ...prev, [species]: errorMsg }));

    onUpdate({
      ...data,
      dadosAnimais: {
        ...data.dadosAnimais,
        [species]: {
          ...currentData,
          [field]: numValue,
          total: newTotal,
          castrados: newCastrados,
          naoCastrados: Math.max(0, newTotal - newCastrados),
          vacinados: newVacinados,
          naoVacinados: Math.max(0, newTotal - newVacinados) // Auto cálculo
        }
      }
    });
  };

  const canSubmit = () => {
    if (hasAnimalsState === false) return true;
    if (hasAnimalsState === true) {
      const { cachorros, gatos } = data.dadosAnimais;
      
      if (!cachorros.possui && !gatos.possui) return false;

      if (cachorros.possui) {
         if (cachorros.total === 0) return false;
         if (cachorros.castrados > cachorros.total) return false;
         if (cachorros.vacinados > cachorros.total) return false;
      }
      if (gatos.possui) {
         if (gatos.total === 0) return false;
         if (gatos.castrados > gatos.total) return false;
         if (gatos.vacinados > gatos.total) return false;
      }
      return true;
    }
    return false;
  };

  // Componente auxiliar para renderizar os inputs de cada espécie
  const renderSpeciesInputs = (species: 'cachorros' | 'gatos', label: string, Icon: any) => {
    const speciesData = data.dadosAnimais[species];
    const speciesError = species === 'cachorros' ? errors.dogs : errors.cats;

    return (
      <div className={`p-4 rounded-xl border transition-all ${speciesData.possui ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
        <label className="flex items-center space-x-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={speciesData.possui}
            onChange={(e) => handleSpeciesToggle(species, e.target.checked)}
            className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          />
          <span className="flex items-center font-medium text-gray-900 dark:text-white text-lg">
            <Icon className="mr-2" size={24} /> {label}
          </span>
        </label>

        {speciesData.possui && (
          <div className="space-y-4 animate-fade-in pl-2 sm:pl-8">
            {/* Linha do Total */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Total de Animais</label>
              <input
                type="number"
                min="0"
                value={speciesData.total || ''}
                onChange={(e) => handleNumberChange(species, 'total', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 text-lg font-semibold"
              />
            </div>

            {/* Grid Castrados / Vacinados */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Castrados</label>
                <input
                  type="number"
                  min="0"
                  value={speciesData.castrados || ''}
                  onChange={(e) => handleNumberChange(species, 'castrados', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${speciesError?.includes('Castrados') ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-500'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                   <Syringe size={12} className="mr-1" /> Vacinados
                </label>
                <input
                  type="number"
                  min="0"
                  value={speciesData.vacinados || ''}
                  onChange={(e) => handleNumberChange(species, 'vacinados', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${speciesError?.includes('Vacinados') ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-500'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2`}
                />
              </div>
            </div>

            {/* Mensagem de Erro */}
            {speciesError && (
              <div className="flex items-center text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <AlertCircle size={14} className="mr-1 flex-shrink-0" />
                {speciesError}
              </div>
            )}

            {/* Cálculos Automáticos */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
               <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded text-center">
                 Não Castrados: <strong className="text-gray-700 dark:text-gray-200">{speciesData.naoCastrados}</strong>
               </div>
               <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded text-center">
                 Não Vacinados: <strong className="text-gray-700 dark:text-gray-200">{speciesData.naoVacinados}</strong>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300 mb-3">
          <PawPrint size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Triagem Animal</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Dados sobre castração e vacinação</p>
      </div>

      {/* Pergunta Inicial */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <p className="font-medium text-gray-900 dark:text-white mb-4">Você possui animais de estimação (cachorros ou gatos) neste endereço?</p>
        <div className="flex space-x-4">
          <button
            onClick={() => handleHasAnimalsChange(true)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
              hasAnimalsState === true
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-brand-300'
            }`}
          >
            Sim
          </button>
          <button
            onClick={() => handleHasAnimalsChange(false)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
              hasAnimalsState === false
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-brand-300'
            }`}
          >
            Não
          </button>
        </div>
      </div>

      {/* Inputs das Espécies */}
      {hasAnimalsState && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Detalhes por espécie:</p>
          {renderSpeciesInputs('cachorros', 'Cachorros', Dog)}
          {renderSpeciesInputs('gatos', 'Gatos', Cat)}
        </div>
      )}

      {/* Botões de Ação */}
      <div className="pt-4 flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit()}
          className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Finalizar Cadastro
        </button>
      </div>
    </div>
  );
};

export default AnimalForm;