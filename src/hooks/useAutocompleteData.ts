'use client';

import { useState, useEffect } from 'react';

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

// Hook para carregar dados de municípios
export function useMunicipios() {
  const [municipios, setMunicipios] = useState<MunicipioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMunicipios = async () => {
      try {
        const response = await fetch('/api/data/municipios');
        if (!response.ok) {
          // Fallback para importação estática
          const data = await import('../data/CdMunicipio.json');
          setMunicipios(data.default);
        } else {
          const data = await response.json();
          setMunicipios(data);
        }
      } catch {
        try {
          // Fallback para importação estática
          const data = await import('../data/CdMunicipio.json');
          setMunicipios(data.default);
        } catch (fallbackErr) {
          setError('Erro ao carregar dados de municípios');
          console.error('Erro ao carregar municípios:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMunicipios();
  }, []);

  return { municipios, loading, error };
}

// Hook para carregar dados de países
export function usePaises() {
  const [paises, setPaises] = useState<PaisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaises = async () => {
      try {
        const response = await fetch('/api/data/paises');
        if (!response.ok) {
          // Fallback para importação estática
          const data = await import('../data/CdPais.json');
          setPaises(data.default);
        } else {
          const data = await response.json();
          setPaises(data);
        }
      } catch {
        try {
          // Fallback para importação estática
          const data = await import('../data/CdPais.json');
          setPaises(data.default);
        } catch (fallbackErr) {
          setError('Erro ao carregar dados de países');
          console.error('Erro ao carregar países:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPaises();
  }, []);

  return { paises, loading, error };
}

// Hook para carregar dados de serviços
export function useServicos() {
  const [servicos, setServicos] = useState<ServicoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServicos = async () => {
      try {
        const response = await fetch('/api/data/servicos');
        if (!response.ok) {
          // Fallback para importação estática
          const data = await import('../data/itensServico.json');
          setServicos(data.default);
        } else {
          const data = await response.json();
          setServicos(data);
        }
      } catch {
        try {
          // Fallback para importação estática
          const data = await import('../data/itensServico.json');
          setServicos(data.default);
        } catch (fallbackErr) {
          setError('Erro ao carregar dados de serviços');
          console.error('Erro ao carregar serviços:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    loadServicos();
  }, []);

  return { servicos, loading, error };
}