import { ViaCepResponse } from '../types';

export const fetchAddressByCep = async (cep: string): Promise<ViaCepResponse | null> => {
  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: ViaCepResponse = await response.json();
    
    if (data.erro) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching CEP:", error);
    return null;
  }
};