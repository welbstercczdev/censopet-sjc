import React from 'react';
import { CensusFormData } from '../types';
import { CheckCircle, Home, Dog, Cat, Save, Syringe } from 'lucide-react'; // Adicionei Syringe

interface SummaryProps {
  data: CensusFormData;
  onSave: () => void;
  onEdit: () => void;
}

const Summary: React.FC<SummaryProps> = ({ data, onSave, onEdit }) => {
  const { cachorros, gatos } = data.dadosAnimais;
  
  const hasDogs = cachorros.possui && cachorros.total > 0;
  const hasCats = gatos.possui && gatos.total > 0;
  const totalAnimals = (hasDogs ? cachorros.total : 0) + (hasCats ? gatos.total : 0);

  // Função auxiliar para renderizar a linha de resumo da espécie
  const renderSpeciesSummary = (speciesName: string, data: any, Icon: any) => (
    <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-700 dark:text-gray-200">
                <Icon size={24} className="mr-3 text-brand-500" />
                <span className="font-medium text-lg">{speciesName}</span>
            </div>
            <span className="bg-white dark:bg-gray-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {data.total}
            </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Castrados</p>
                <p className="text-gray-900 dark:text-white font-medium">{data.castrados}</p>
            </div>
            <div className="text-center border-l border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold flex items-center justify-center gap-1">
                    <Syringe size={10} /> Vacinados
                </p>
                <p className="text-gray-900 dark:text-white font-medium">{data.vacinados}</p>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-center pb-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300 mb-2">
        <CheckCircle size={32} />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revisão</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Confira os dados antes de salvar no dispositivo.</p>

      {/* Endereço (igual ao anterior) */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-left border border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2 dark:border-gray-700">Resumo do Endereço</h3>
        <div className="flex items-start space-x-3 text-gray-700 dark:text-gray-300">
          <Home className="flex-shrink-0 mt-1" size={18} />
          <div>
            <p className="font-medium">{data.endereco.logradouro}, {data.endereco.numero}</p>
            {data.endereco.complemento && <p className="text-sm text-gray-500">{data.endereco.complemento}</p>}
            <p className="text-sm">{data.endereco.bairro}</p>
          </div>
        </div>
      </div>

      {/* Animais */}
      {data.possuiAnimais && totalAnimals > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2 dark:border-gray-700 text-left">Dados dos Animais</h3>
             
             <div className="space-y-4 text-left">
                {hasDogs && renderSpeciesSummary('Cachorros', cachorros, Dog)}
                {hasCats && renderSpeciesSummary('Gatos', gatos, Cat)}
             </div>
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-gray-500 dark:text-gray-400 italic">
            Nenhum animal cadastrado neste endereço.
        </div>
      )}

      {/* Botões */}
      <div className="flex flex-col gap-3 mt-6">
        <button
            onClick={onSave}
            className="w-full py-4 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg flex items-center justify-center transition-transform transform hover:scale-[1.01]"
        >
            <Save size={20} className="mr-2" />
            Confirmar e Salvar
        </button>
        <button
            onClick={onEdit}
            className="w-full py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
        >
            Voltar e Editar
        </button>
      </div>
    </div>
  );
};

export default Summary;