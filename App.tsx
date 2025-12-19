// --- START OF FILE src/App.tsx ---

import React, { useState, useEffect } from 'react';
import AddressForm from './components/AddressForm';
import AnimalForm from './components/AnimalForm';
import Summary from './components/Summary';
import Dashboard from './components/Dashboard';
import ThemeToggle from './components/ThemeToggle';
import AgentConfig from './components/AgentConfig';
import InstallPWA from './components/InstallPWA';
import ConfirmModal from './components/ConfirmModal';
import Toast, { ToastType } from './components/Toast';
import { CensusFormData, CensusRecord, AgentInfo } from './types';
import { ClipboardList, ChevronLeft } from 'lucide-react';
import { uuidv7 } from './services/uuidService';

// Estado inicial completo, incluindo os campos de vacinação
const getInitialData = (): CensusFormData => ({
  endereco: {
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    localidade: '',
    uf: ''
  },
  possuiAnimais: false,
  dadosAnimais: {
    cachorros: { possui: false, total: 0, castrados: 0, naoCastrados: 0, vacinados: 0, naoVacinados: 0 },
    gatos: { possui: false, total: 0, castrados: 0, naoCastrados: 0, vacinados: 0, naoVacinados: 0 }
  }
});

const STORAGE_KEY = 'censopet_sjc_records';
const AGENT_STORAGE_KEY = 'censopet_sjc_agent';

const App: React.FC = () => {
  // Navegação: 0 = Dashboard, 1 = Endereço, 2 = Animais, 3 = Resumo
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<CensusFormData>(getInitialData());
  const [records, setRecords] = useState<CensusRecord[]>([]);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  
  // Estados de Interface
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estado do Modal de Confirmação Customizado
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    isDestructive: false
  });

  // Estado do Toast (Notificação)
  const [toast, setToast] = useState<{ message: string | null, type: ToastType }>({
    message: null,
    type: 'success'
  });

  // Função auxiliar para disparar notificações
  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao ler registros salvos", e);
      }
    }

    const savedAgent = localStorage.getItem(AGENT_STORAGE_KEY);
    if (savedAgent) {
      try {
        setAgentInfo(JSON.parse(savedAgent));
      } catch (e) {
        console.error("Erro ao ler agente salvo", e);
      }
    }
  }, []);

  // Salvar automaticamente quando houver mudanças
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (agentInfo) {
      localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agentInfo));
    }
  }, [agentInfo]);

  // Atualizadores de Estado do Formulário
  const updateFormData = (newData: Partial<CensusFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const updateAddress = (addressData: any) => {
    updateFormData({ endereco: addressData });
  };

  // Iniciar Nova Coleta
  const startNewCensus = () => {
    setEditingId(null);
    
    // Recurso Inteligente: Copiar endereço do último registro para agilizar
    if (records.length > 0) {
      const lastRecord = records[records.length - 1];
      const initialData = getInitialData();
      
      setFormData({
        ...initialData,
        endereco: {
          ...lastRecord.endereco,
          numero: '',
          complemento: ''
        }
      });
    } else {
      setFormData(getInitialData());
    }

    setStep(1);
  };

  // Editar Registro Existente
  const handleEditRecord = (id: string) => {
    const recordToEdit = records.find(r => r.id === id);
    if (recordToEdit) {
        setFormData({
            endereco: recordToEdit.endereco,
            possuiAnimais: recordToEdit.possuiAnimais,
            dadosAnimais: recordToEdit.dadosAnimais
        });
        setEditingId(id);
        setStep(1);
    }
  };

  // Excluir Registro (Com Modal de Confirmação)
  const requestDeleteRecord = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Registro',
      message: 'Deseja realmente excluir este registro? Esta ação não pode ser desfeita.',
      isDestructive: true,
      action: () => {
        setRecords(prev => prev.filter(r => r.id !== id));
        showToast('Registro excluído com sucesso.', 'success');
      }
    });
  };

  // Salvar Coleta (Novo ou Edição)
  const handleSave = () => {
    // Validação: Agente é obrigatório
    if (!agentInfo && !editingId) {
        setIsAgentModalOpen(true);
        showToast('Identifique-se antes de iniciar.', 'info');
        return; 
    }

    const currentAgentName = agentInfo?.name || 'Não Identificado';
    const currentAgentId = agentInfo?.id || 'N/A';

    if (editingId) {
        // Atualizar existente
        setRecords(prev => prev.map(record => {
            if (record.id === editingId) {
                return {
                    ...record,
                    ...formData,
                    timestamp: new Date().toISOString(), // Atualiza data de modificação
                    deviceInfo: navigator.userAgent,
                    // Preserva o agente original se existir
                    agentName: record.agentName || currentAgentName,
                    agentId: record.agentId || currentAgentId
                };
            }
            return record;
        }));
        showToast('Registro atualizado!', 'success');
    } else {
        // Criar novo com UUIDv7 (Segurança e Ordenação Temporal)
        const newRecord: CensusRecord = {
            ...formData,
            id: uuidv7(), 
            timestamp: new Date().toISOString(),
            deviceInfo: navigator.userAgent,
            agentName: currentAgentName,
            agentId: currentAgentId
        };
        setRecords(prev => [...prev, newRecord]);
        showToast('Coleta salva com sucesso!', 'success');
    }
    
    setEditingId(null);
    setStep(0); // Volta para o Dashboard
  };

  const handleBackToDashboard = () => {
    if (step === 1) {
        setEditingId(null);
        setStep(0);
    } else {
        setStep(step - 1);
    }
  };

  // Exportar para JSON (Arquivo ou Compartilhamento Nativo)
  const handleExport = async () => {
    if (!agentInfo || !agentInfo.name || !agentInfo.id) {
        setIsAgentModalOpen(true);
        showToast('Identifique-se antes de exportar.', 'error');
        return;
    }

    // Injeta o agente atual em registros antigos/sem dono
    const recordsToExport = records.map(record => ({
        ...record,
        agentName: record.agentName || agentInfo.name,
        agentId: record.agentId || agentInfo.id
    }));

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
    
    // Sanitiza nome do arquivo
    const sanitizedName = agentInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedId = agentInfo.id.replace(/[^a-zA-Z0-9]/g, '-');

    const fileName = `CensoPet_${sanitizedName}_${sanitizedId}_${dateStr}_${timeStr}.json`;
    const dataStr = JSON.stringify(recordsToExport, null, 2);
    
    const blob = new Blob([dataStr], { type: "application/json" });
    const file = new File([blob], fileName, { type: "application/json" });

    // Tenta usar compartilhamento nativo do Android/iOS
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Exportação CensoPet SJC',
          text: `Dados coletados por ${agentInfo.name} (${agentInfo.id}). Contém ${records.length} registros.`
        });
        return;
      } catch (e) {
        console.warn("Compartilhamento nativo falhou ou cancelado, iniciando download...", e);
      }
    }
    
    // Fallback: Download direto no navegador
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Arquivo gerado com sucesso!', 'success');
  };

  // Processamento de Importação de Arquivo
  const processImportedData = (importedData: any[]) => {
      if (!Array.isArray(importedData)) {
          showToast("Formato de arquivo inválido.", 'error');
          return;
      }

      // Validação simples
      if (importedData.length > 0 && (!importedData[0].id || !importedData[0].endereco)) {
           showToast("Os dados não parecem ser do CensoPet.", 'error');
           return;
      }

      // Evita duplicatas baseadas no ID
      const currentIds = new Set(records.map(r => r.id));
      const newRecords = importedData.filter((r: CensusRecord) => {
          return r.id && r.endereco && !currentIds.has(r.id);
      });

      if (newRecords.length > 0) {
          setRecords(prev => [...prev, ...newRecords]);
          showToast(`${newRecords.length} registros importados!`, 'success');
      } else {
          showToast("Nenhum registro novo encontrado.", 'info');
      }
  };

  const handleFileImport = async (file: File) => {
    try {
        const text = await file.text();
        const importedData = JSON.parse(text);
        processImportedData(importedData);
    } catch (error) {
        console.error("Import error:", error);
        showToast("Erro ao ler o arquivo JSON.", 'error');
    }
  };

  // Limpar Tudo (Com Modal de Confirmação)
  const requestClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Apagar Tudo?',
      message: 'Tem certeza que deseja apagar todos os registros deste dispositivo? Esta ação é irreversível.',
      isDestructive: true,
      action: () => {
        setRecords([]);
        showToast('Todos os registros foram apagados.', 'info');
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      
      {/* Componente Global de Notificações */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, message: null })} 
      />

      {/* Modal de Confirmação Global */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
      />

      <div className="w-full max-w-md md:max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col">
        
        {/* Cabeçalho */}
        <div className="bg-white dark:bg-gray-900 p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            {step > 0 && (
                <button 
                  onClick={handleBackToDashboard}
                  className="mr-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ChevronLeft size={20} className="text-gray-500" />
                </button>
            )}
            <div className="bg-brand-500 text-white p-2 rounded-lg">
               <ClipboardList size={20} />
            </div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white tracking-tight">
              CensoPet <span className="text-brand-500">SJC</span>
              {editingId && step > 0 && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-normal">Editando</span>}
            </h1>
          </div>
          
          <div className="flex items-center">
            <InstallPWA />
            <ThemeToggle />
          </div>
        </div>

        {/* Barra de Progresso (Apenas durante cadastro) */}
        {step > 0 && (
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5">
                <div 
                    className={`h-1.5 transition-all duration-500 ease-out ${editingId ? 'bg-yellow-500' : 'bg-brand-500'}`}
                    style={{ width: `${(step / 3) * 100}%` }}
                ></div>
            </div>
        )}

        {/* Área de Conteúdo Principal */}
        <div className="p-6 md:p-8 flex-grow overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          
          {step === 0 && (
            <Dashboard 
              records={records}
              agentInfo={agentInfo}
              onStartNew={startNewCensus}
              onExport={handleExport}
              onImportFile={handleFileImport}
              onClear={requestClearAll}
              onEdit={handleEditRecord}
              onDelete={requestDeleteRecord}
              onOpenAgentConfig={() => setIsAgentModalOpen(true)}
            />
          )}

          {step === 1 && (
            <AddressForm 
              data={formData.endereco} 
              onUpdate={updateAddress} 
              onNext={() => setStep(2)} 
            />
          )}

          {step === 2 && (
            <AnimalForm 
              data={formData} 
              onUpdate={(d) => setFormData(d)}
              onBack={() => setStep(1)}
              onSubmit={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <Summary 
              data={formData} 
              onSave={handleSave} 
              onEdit={() => setStep(2)}
            />
          )}
        </div>
        
        {/* Rodapé */}
        <div className="bg-gray-50 dark:bg-gray-950 p-4 text-center text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800">
            &copy; {new Date().getFullYear()} CensoPet SJC v1.0
        </div>
      </div>

      {/* Modal de Configuração do Agente */}
      <AgentConfig 
        isOpen={isAgentModalOpen} 
        onClose={() => setIsAgentModalOpen(false)} 
        onSave={(info) => {
          setAgentInfo(info);
          showToast('Agente identificado!', 'success');
        }}
        initialData={agentInfo}
      />
    </div>
  );
};

export default App;