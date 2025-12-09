
export interface AddressData {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  uf?: string;
  localidade?: string;
}

export interface AnimalSpeciesData {
  possui: boolean;
  total: number;
  castrados: number;
  naoCastrados: number; 
  vacinados: number;      
  naoVacinados: number;
}

export interface AnimalData {
  cachorros: AnimalSpeciesData;
  gatos: AnimalSpeciesData;
}

export interface CensusFormData {
  endereco: AddressData;
  possuiAnimais: boolean;
  dadosAnimais: AnimalData;
}

export interface CensusRecord extends CensusFormData {
  id: string;
  timestamp: string;
  deviceInfo?: string;
  agentName?: string; 
  agentId?: string;
}

export interface AgentInfo {
  name: string;
  id: string; // Matrícula
}

// ViaCEP API Response Type
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}
