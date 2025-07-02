// Hook para manter estado persistente no localStorage

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nfse-form-data';

export function usePersistentState<T>(initialValue: T, key: string = STORAGE_KEY) {
  const [state, setState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega dados do localStorage na inicialização
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsedData = JSON.parse(saved);
        setState(parsedData);
      }
    } catch (error) {
      console.warn('Erro ao carregar dados salvos:', error);
      // Se houver erro, remove dados corrompidos
      localStorage.removeItem(key);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  // Salva dados no localStorage sempre que o estado mudar
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.warn('Erro ao salvar dados:', error);
      }
    }
  }, [state, key, isLoaded]);

  // Função para limpar os dados salvos
  const clearPersistentState = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState(initialValue);
    } catch (error) {
      console.warn('Erro ao limpar dados salvos:', error);
    }
  }, [key, initialValue]);

  // Função para resetar com novos dados
  const resetWithData = useCallback((newData: T) => {
    setState(newData);
  }, []);

  return {
    state,
    setState,
    isLoaded,
    clearPersistentState,
    resetWithData
  };
}

// Hook específico para dados da NFSe
export function useNFSeFormState<T>(initialValue: T) {
  return usePersistentState(initialValue, 'nfse-form-data');
}

// Utilitário para verificar se há dados salvos
export function hasSavedFormData(): boolean {
  try {
    const saved = localStorage.getItem('nfse-form-data');
    return saved !== null && saved.trim() !== '';
  } catch {
    return false;
  }
}

// Utilitário para obter preview dos dados salvos
export function getSavedDataPreview(): { hasData: boolean; lastModified?: string; dataSize?: string } {
  try {
    const saved = localStorage.getItem('nfse-form-data');
    if (!saved) {
      return { hasData: false };
    }

    const data = JSON.parse(saved);
    const sizeKB = (saved.length / 1024).toFixed(1);
    
    // Tenta extrair data de modificação dos dados
    let lastModified = 'Desconhecido';
    if (data?.infDPS?.dhEmi) {
      const date = new Date(data.infDPS.dhEmi);
      lastModified = date.toLocaleString('pt-BR');
    }

    return {
      hasData: true,
      lastModified,
      dataSize: `${sizeKB} KB`
    };
  } catch {
    return { hasData: false };
  }
}