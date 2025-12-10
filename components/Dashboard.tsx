// --- START OF FILE components/Dashboard.tsx ---

import React, { useRef, useState } from 'react';
import { Plus, Download, Share2, Trash2, Database, FileJson, Pencil, MapPin, Calendar, ChevronLeft, ChevronRight, Upload, User, Settings, QrCode } from 'lucide-react';
import { CensusRecord, AgentInfo } from '../types';
import SyncModal from './SyncModal';

interface DashboardProps {
  records: CensusRecord[];
  agentInfo: AgentInfo | null;
  onStartNew: () => void;
  onExport: () => void;
  onImport: (data: CensusRecord[]) => void; // Para dados do QR Code
  onImportFile: (file: File) => void;       // Para upload de arquivo
  onClear: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenAgentConfig: () => void;
}

const ITEMS_PER_PAGE = 5;

const Dashboard: React.FC<DashboardProps> = ({ records, agentInfo, onStartNew, onExport, onImport, onImportFile, onClear, onEdit, onDelete, onOpenAgentConfig }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const totalRecords = records.length;
  const lastSync = records.length > 0 
    ? new Date(records[records.length - 1].timestamp).toLocaleString('pt-BR') 
    : 'N/A';

  // Sort records by newest first
  const sortedRecords = [...records].reverse();
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

  // Adjust current page if needed
  const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  
  const currentRecords = sortedRecords.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportFile(e.target.files[0]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-6">
      
      {/* Agent Info Header */}
      <div 
        onClick={onOpenAgentConfig}
        className="bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-800 dark:to-brand-900 rounded-xl p-4 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all relative group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
               <User size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-brand-100 uppercase tracking-wide">Agente Responsável</p>
              <h3 className="font-bold text-lg truncate max-w-[200px] sm:max-w-xs">
                {agentInfo ? agentInfo.name : 'Toque para identificar'}
              </h3>
              {agentInfo && <p className="text-xs text-brand-100/80">Matrícula: {agentInfo.id}</p>}
            </div>
          </div>
          <Settings size={20} className="text-white/70 group-hover:text-white transition-colors" />
        </div>
      </div>

      <div className="text-center mb-6">
         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Painel de Coleta</h2>
         <p className="text-gray-500 dark:text-gray-400">Gerencie as coletas armazenadas.</p>
      </div>

      {/* Stats Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 p-4 opacity-5 dark:opacity-10">
          <Database size={100} />
        </div>
        <div className="relative z-10">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registros Salvos</p>
          <div className="flex items-baseline mt-2">
            <span className="text-4xl font-extrabold text-brand-600 dark:text-brand-400">{totalRecords}</span>
            <span className="ml-2 text-sm text-gray-500">coletas</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Última atualização: {lastSync}</p>
        </div>
      </div>

      {/* Main Actions */}
      <div className="flex flex-col gap-3">
        {/* Primary Action */}
        <button
          onClick={onStartNew}
          className="flex items-center justify-center w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus size={24} className="mr-3" />
          Nova Coleta
        </button>

        {/* Secondary Actions Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Botão Exportar (Arquivo/Share) */}
          <button
            onClick={onExport}
            disabled={totalRecords === 0}
            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="mb-1 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                {navigator.share ? <Share2 size={18} /> : <Download size={18} />}
            </div>
            <span className="text-xs sm:text-sm">{navigator.share ? 'Enviar' : 'Arquivo'}</span>
          </button>

          {/* Botão QR Code (Novo) */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors"
          >
             <div className="mb-1 p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                <QrCode size={18} />
            </div>
            <span className="text-xs sm:text-sm">QR Code</span>
          </button>

          {/* Botão Importar Arquivo */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors"
          >
             <div className="mb-1 p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                <Upload size={18} />
            </div>
            <span className="text-xs sm:text-sm">Ler Arq.</span>
          </button>
        </div>

        {/* Destructive Action */}
        <button
          onClick={onClear}
          disabled={totalRecords === 0}
          className="w-full py-3 px-4 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Trash2 size={16} className="mr-2" />
          Limpar Todos os Registros
        </button>
      </div>

      {/* Hidden File Input for Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      {/* Modal de Sincronização via QR */}
      <SyncModal 
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        dataToExport={records}
        onImportData={onImport}
      />

      {totalRecords > 0 && (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg text-xs text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 flex items-start">
                <FileJson size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                <p>Use "Enviar" ou "QR Code" para transferir os dados para o líder da equipe.</p>
            </div>

            {/* List of Records */}
            <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
                    <span>Histórico</span>
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                        Página {safeCurrentPage} de {totalPages || 1}
                    </span>
                </h3>
                
                <div className="space-y-3 min-h-[300px]">
                    {currentRecords.map((record) => (
                        <div key={record.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-3 animate-fade-in">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 overflow-hidden">
                                    <div className="mt-1 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 flex-shrink-0">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {record.endereco.logradouro || 'Sem logradouro'}, {record.endereco.numero}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {record.endereco.bairro}
                                        </p>
                                        <div className="flex items-center mt-1 space-x-2">
                                            <p className="text-xs text-gray-400 flex items-center">
                                                <Calendar size={10} className="mr-1" />
                                                {new Date(record.timestamp).toLocaleString('pt-BR')}
                                            </p>
                                            {record.agentName && (
                                              <span className="text-[10px] bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                                                {record.agentName}
                                              </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button 
                                    onClick={() => onEdit(record.id)}
                                    className="flex items-center px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 rounded-md transition-colors"
                                >
                                    <Pencil size={14} className="mr-1.5" />
                                    Editar
                                </button>
                                <button 
                                    onClick={() => onDelete(record.id)}
                                    className="flex items-center px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors"
                                >
                                    <Trash2 size={14} className="mr-1.5" />
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                    {currentRecords.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum registro encontrado.
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-6 pt-2">
                        <button
                            onClick={() => goToPage(safeCurrentPage - 1)}
                            disabled={safeCurrentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        
                        <div className="flex space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 5) {
                                    if (safeCurrentPage > 3) {
                                        pageNum = safeCurrentPage - 2 + i;
                                    }
                                    if (pageNum > totalPages) {
                                        pageNum = totalPages - 4 + i;
                                    }
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                            safeCurrentPage === pageNum
                                                ? 'bg-brand-600 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => goToPage(safeCurrentPage + 1)}
                            disabled={safeCurrentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
          </>
      )}
    </div>
  );
};

export default Dashboard;