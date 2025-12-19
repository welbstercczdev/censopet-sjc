import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface AutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

// Dicionário expandido de abreviações para Bairros e Logradouros
const ABBREVIATIONS: Record<string, string> = {
  // Tipos de Logradouro/Bairro
  'R': 'RUA',
  'AV': 'VENIDA', // "Avenida" sem o A para evitar duplicar se digitar "Av A"
  'AL': 'ALAMEDA',
  'ALAM': 'ALAMEDA',
  'TR': 'TRAVESSA',
  'TRAV': 'TRAVESSA',
  'ROD': 'RODOVIA',
  'EST': 'ESTRADA', // Cuidado: pode ser Estância, mas Estrada é mais comum em logradouros
  'ESTANC': 'ESTANCIA',
  'VL': 'VILA',
  'VLA': 'VILA',
  'JD': 'JARDIM',
  'JDM': 'JARDIM',
  'PQ': 'PARQUE',
  'PQUE': 'PARQUE',
  'CJ': 'CONJUNTO',
  'CJO': 'CONJUNTO',
  'CONJ': 'CONJUNTO',
  'RES': 'RESIDENCIAL',
  'RESID': 'RESIDENCIAL',
  'COND': 'CONDOMINIO',
  'HAB': 'HABITACIONAL',
  'HABI': 'HABITACIONAL',
  'CH': 'CHACARA',
  'CHAC': 'CHACARA',
  'REC': 'RECANTO',
  'SIT': 'SITIO',
  'FAZ': 'FAZENDA',
  'LOT': 'LOTEAMENTO',
  'PORT': 'PORTAL',
  
  // Títulos e Religiosos
  'STA': 'SANTA',
  'STO': 'SANTO',
  'S': 'SAO',
  'NSA': 'NOSSA SENHORA',
  'NS': 'NOSSA SENHORA',
  'N': 'NOSSA',
  'SRA': 'SENHORA',
  'DR': 'DOUTOR',
  'DRA': 'DOUTORA',
  'PROF': 'PROFESSOR',
  'PROFA': 'PROFESSORA',
  'ENG': 'ENGENHEIRO',
  'CEL': 'CORONEL',
  'GAL': 'GENERAL',
  'CAP': 'CAPITAO',
  'TEN': 'TENENTE',
  'SGT': 'SARGENTO',
  'PRES': 'PRESIDENTE',
  'GOV': 'GOVERNADOR'
};

const AutocompleteInput: React.FC<AutocompleteProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
  id
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const match = options.some(opt => opt.toLowerCase() === value.toLowerCase());
    setIsExactMatch(match);
  }, [value, options]);

  // Normalizador Poderoso
  const normalizeForSearch = (text: string) => {
    if (!text) return "";

    // 1. Remove acentos, caixa alta e PONTUAÇÃO (pontos de abreviação)
    let normalized = text.toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/\./g, " ") // Troca ponto por espaço (Ex: "VL.EMA" -> "VL EMA")
      .replace(/\s+/g, " ") // Remove espaços duplos
      .trim();
    
    // 2. Separa as palavras para analisar uma por uma
    const words = normalized.split(" ");

    // 3. Substitui abreviações conhecidas
    const expandedWords = words.map(word => {
      // Verifica se a palavra exata existe no dicionário
      return ABBREVIATIONS[word] || word;
    });

    return expandedWords.join(" ");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value;
    onChange(userInput);

    if (userInput.length > 1) {
      // O segredo: Normalizamos o que o usuário digitou E as opções da lista
      const normalizedInput = normalizeForSearch(userInput);
      const searchTerms = normalizedInput.split(' ');

      const filtered = options.filter((option) => {
        const normalizedOption = normalizeForSearch(option);
        
        // Verifica se TODOS os termos digitados aparecem na opção oficial
        return searchTerms.every(term => normalizedOption.includes(term));
      })
      // Ordenação inteligente: Preferência para quem COMEÇA com o termo
      .sort((a, b) => {
        const normA = normalizeForSearch(a);
        const normB = normalizeForSearch(b);
        const startsA = normA.startsWith(normalizedInput) ? -1 : 1;
        const startsB = normB.startsWith(normalizedInput) ? -1 : 1;
        return startsA - startsB;
      })
      .slice(0, 10);
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          id={id}
          value={value}
          onChange={handleInputChange}
          onFocus={(e) => handleInputChange(e)}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all 
            ${!isExactMatch && value.length > 3 
              ? 'border-yellow-400 focus:ring-yellow-400 focus:border-yellow-400' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-brand-500 focus:border-transparent'
            }`}
          autoComplete="off"
        />
        
        {!isExactMatch && value.length > 3 && (
          <div className="absolute right-3 top-2.5 text-yellow-500 pointer-events-none animate-pulse">
            <AlertCircle size={20} />
          </div>
        )}
      </div>

      {!isExactMatch && value.length > 3 && !showSuggestions && (
        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1 ml-1 font-medium">
          Atenção: Bairro novo ou grafia diferente da oficial.
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto animate-fade-in">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="px-4 py-3 hover:bg-brand-50 dark:hover:bg-brand-900/20 cursor-pointer text-gray-700 dark:text-gray-200 text-sm border-b border-gray-100 dark:border-gray-700/50 last:border-0"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;