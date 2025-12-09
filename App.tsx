import React, { useState, useEffect } from 'react';
import AddressForm from './components/AddressForm';
import AnimalForm from './components/AnimalForm';
import Summary from './components/Summary';
import Dashboard from './components/Dashboard';
import ThemeToggle from './components/ThemeToggle';
import AgentConfig from './components/AgentConfig';
import { CensusFormData, CensusRecord, AgentInfo } from './types';
import { ClipboardList, ChevronLeft } from 'lucide-react';
import { uuidv7 } from './services/uuidService';

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
  // Step 0 = Dashboard, 1 = Address, 2 = Animals, 3 = Summary
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<CensusFormData>(getInitialData());
  const [records, setRecords] = useState<CensusRecord[]>([]);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load records and agent info from local storage on startup
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved records", e);
      }
    }

    const savedAgent = localStorage.getItem(AGENT_STORAGE_KEY);
    if (savedAgent) {
      try {
        setAgentInfo(JSON.parse(savedAgent));
      } catch (e) {
        console.error("Error parsing saved agent", e);
      }
    }
  }, []);

  // Persist records when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  // Persist agent info
  useEffect(() => {
    if (agentInfo) {
      localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agentInfo));
    }
  }, [agentInfo]);

  const updateFormData = (newData: Partial<CensusFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const updateAddress = (addressData: any) => {
    updateFormData({ endereco: addressData });
  };

  const startNewCensus = () => {
    setEditingId(null);
    
    // Smart pre-fill: Check if there is a previous record to copy address from
    if (records.length > 0) {
      const lastRecord = records[records.length - 1];
      const initialData = getInitialData();
      
      // Copy address fields but clear number and complement
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

  const handleDeleteRecord = (id: string) => {
    if (window.confirm("Deseja realmente excluir este registro?")) {
        setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSave = () => {
    // Validação de segurança: Agente deve estar identificado
    if (!agentInfo && !editingId) {
        setIsAgentModalOpen(true);
        return; // Impede salvar sem agente
    }

    const currentAgentName = agentInfo?.name || 'Não Identificado';
    const currentAgentId = agentInfo?.id || 'N/A';

    if (editingId) {
        // Atualizar registro existente
        setRecords(prev => prev.map(record => {
            if (record.id === editingId) {
                return {
                    ...record,
                    ...formData,
                    timestamp: new Date().toISOString(),
                    deviceInfo: navigator.userAgent,
                    // Mantém o agente original se já existir, senão usa o atual
                    agentName: record.agentName || currentAgentName, 
                    agentId: record.agentId || currentAgentId
                };
            }
            return record;
        }));
    } else {
        // Criar novo registro USANDO UUIDv7
        const newRecord: CensusRecord = {
            ...formData,
            id: uuidv7(), // <--- MUDANÇA AQUI (antes era crypto.randomUUID())
            timestamp: new Date().toISOString(),
            deviceInfo: navigator.userAgent,
            agentName: currentAgentName,
            agentId: currentAgentId
        };
        setRecords(prev => [...prev, newRecord]);
    }
    
    setEditingId(null);
    setStep(0);
  };

  const handleBackToDashboard = () => {
    if (step === 1) {
        setEditingId(null); // Clear editing state if canceling
        setStep(0);
    } else {
        setStep(step - 1);
    }
  };

  const handleExport = async () => {
    // Validation: Agent info must be present
    if (!agentInfo || !agentInfo.name || !agentInfo.id) {
        setIsAgentModalOpen(true);
        alert("Por favor, identifique-se (Nome e Matrícula) antes de exportar os dados.");
        return;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '-'); // HH-MM
    
    // Sanitize filename
    const sanitizedName = agentInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedId = agentInfo.id.replace(/[^a-zA-Z0-9]/g, '-');

    const fileName = `CensoPet_${sanitizedName}_${sanitizedId}_${dateStr}_${timeStr}.json`;
    
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const file = new File([blob], fileName, { type: "application/json" });

    // Try native share API (Mobile friendly)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Exportação CensoPet SJC',
          text: `Dados coletados por ${agentInfo.name} (${agentInfo.id}). Contém ${records.length} registros.`
        });
        return;
      } catch (e) {
        console.log("Share failed or cancelled, falling back to download", e);
      }
    }
    
    // Fallback to direct download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
        const text = await file.text();
        const importedData = JSON.parse(text);
        
        if (!Array.isArray(importedData)) {
            alert("Arquivo inválido. O formato deve ser uma lista de registros JSON.");
            return;
        }

        // Basic structural validation on the first item if exists
        if (importedData.length > 0 && (!importedData[0].id || !importedData[0].endereco)) {
             alert("O arquivo não parece conter dados válidos do CensoPet.");
             return;
        }

        const currentIds = new Set(records.map(r => r.id));
        const newRecords = importedData.filter((r: CensusRecord) => {
            // Validate essential fields and check duplicates
            return r.id && r.endereco && !currentIds.has(r.id);
        });

        if (newRecords.length > 0) {
            setRecords(prev => [...prev, ...newRecords]);
            alert(`Importação concluída!\n\n${newRecords.length} novos registros adicionados.\n${importedData.length - newRecords.length} duplicatas ignoradas.`);
        } else {
            alert("Nenhum registro novo encontrado. Todos os registros do arquivo já existem neste dispositivo.");
        }

    } catch (error) {
        console.error("Import error:", error);
        alert("Erro ao ler o arquivo. Verifique se é um JSON válido.");
    }
  };

  const handleClear = () => {
    if (window.confirm("Tem certeza que deseja apagar todos os registros salvos neste dispositivo? Esta ação não pode ser desfeita.")) {
      setRecords([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-md md:max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col">
        
        {/* Header */}
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
          <ThemeToggle />
        </div>

        {/* Progress Bar (Only during collection) */}
        {step > 0 && (
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5">
                <div 
                    className={`h-1.5 transition-all duration-500 ease-out ${editingId ? 'bg-yellow-500' : 'bg-brand-500'}`}
                    style={{ width: `${(step / 3) * 100}%` }}
                ></div>
            </div>
        )}

        {/* Content Area */}
        <div className="p-6 md:p-8 flex-grow overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          
          {step === 0 && (
            <Dashboard 
              records={records}
              agentInfo={agentInfo}
              onStartNew={startNewCensus}
              onExport={handleExport}
              onImport={handleImport}
              onClear={handleClear}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
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
        
        {/* Footer info */}
        <div className="bg-gray-50 dark:bg-gray-950 p-4 text-center text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800">
            &copy; {new Date().getFullYear()} CensoPet SJC v1.0
        </div>
      </div>

      {/* Modals */}
      <AgentConfig 
        isOpen={isAgentModalOpen} 
        onClose={() => setIsAgentModalOpen(false)} 
        onSave={(info) => setAgentInfo(info)}
        initialData={agentInfo}
      />
    </div>
  );
};

export default App;