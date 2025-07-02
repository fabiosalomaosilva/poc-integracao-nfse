'use client';

import { useQuery } from '@tanstack/react-query';

// Tipos dos dados
export interface MunicipioData {
  Estado: string;
  Uf: string;
  Municipio: string;
  Codigo: string;
}

export interface PaisData {
  Codigo: string;
  Nome: string;
}

export interface ServicoData {
  codigo: string;
  descricao: string;
}

// Função para carregar municípios com fallback
async function fetchMunicipios(): Promise<MunicipioData[]> {
  try {
    const response = await fetch('/api/data/municipios');
    if (!response.ok) {
      throw new Error('API não disponível');
    }
    return await response.json();
  } catch {
    // Fallback para importação estática
    const data = await import('../data/CdMunicipio.json');
    return data.default;
  }
}

// Função para carregar países com fallback
async function fetchPaises(): Promise<PaisData[]> {
  try {
    const response = await fetch('/api/data/paises');
    if (!response.ok) {
      throw new Error('API não disponível');
    }
    return await response.json();
  } catch {
    // Fallback para importação estática
    const data = await import('../data/CdPais.json');
    return data.default;
  }
}

// Função para carregar serviços com fallback
async function fetchServicos(): Promise<ServicoData[]> {
  try {
    const response = await fetch('/api/data/servicos');
    if (!response.ok) {
      throw new Error('API não disponível');
    }
    return await response.json();
  } catch {
    // Fallback para importação estática
    const data = await import('../data/itensServico.json');
    return data.default;
  }
}

// Hook para carregar dados de municípios com cache
export function useMunicipios() {
  const { data: municipios = [], isLoading: loading, error } = useQuery({
    queryKey: ['municipios'],
    queryFn: fetchMunicipios,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });

  return { 
    municipios, 
    loading, 
    error: error ? 'Erro ao carregar dados de municípios' : null 
  };
}

// Hook para carregar dados de países com cache
export function usePaises() {
  const { data: paises = [], isLoading: loading, error } = useQuery({
    queryKey: ['paises'],
    queryFn: fetchPaises,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });

  return { 
    paises, 
    loading, 
    error: error ? 'Erro ao carregar dados de países' : null 
  };
}

// Hook para carregar dados de serviços com cache
export function useServicos() {
  const { data: servicos = [], isLoading: loading, error } = useQuery({
    queryKey: ['servicos'],
    queryFn: fetchServicos,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });

  return { 
    servicos, 
    loading, 
    error: error ? 'Erro ao carregar dados de serviços' : null 
  };
}