'use client';

import { useState, useEffect } from 'react';
import Tabs from '../ui/Tabs';
import DadosGeraisForm from './forms/DadosGeraisForm';
import PrestadorForm from './forms/PrestadorForm';
import TomadorForm from './forms/TomadorForm';
import IntermediarioForm from './forms/IntermediarioForm';
import ServicosForm from './forms/ServicosForm';
import ValoresForm from './forms/ValoresForm';
import { CompleteDPSData } from '../../types/nfse/complete';
import { loadXMLTemplate } from '../../utils/xmlTemplateParser';

interface CompleteNFSeFormProps {
  onXMLGenerated: (xml: string) => void;
}

export default function CompleteNFSeForm({ onXMLGenerated }: CompleteNFSeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [templateLoading, setTemplateLoading] = useState(true);
  
  // Estado do formulário completo
  const [formData, setFormData] = useState<CompleteDPSData>({
    versao: '1.00',
    infDPS: {
      Id: '',
      tpAmb: '2', // Homologação por padrão
      dhEmi: new Date().toISOString(),
      verAplic: '1.00',
      serie: '00001',
      nDPS: '1',
      dCompet: new Date().toISOString().substring(0, 7),
      tpEmit: '1', // Prestador
      cLocEmi: '',
      
      prest: {
        CNPJ: '',
        xNome: '',
        end: {
          endNac: {
            cMun: '',
            CEP: ''
          },
          xLgr: '',
          nro: '',
          xBairro: ''
        },
        regTrib: {
          opSimpNac: '1',
          regEspTrib: '0'
        }
      },
      
      toma: {
        CNPJ: '',
        xNome: '',
        end: {
          endNac: {
            cMun: '',
            CEP: ''
          },
          xLgr: '',
          nro: '',
          xBairro: ''
        }
      },
      
      serv: {
        locPrest: {
          cLocPrestacao: ''
        },
        cServ: {
          cTribNac: '',
          xDescServ: ''
        }
      },
      
      valores: {
        vServPrest: {
          vServ: 0
        },
        trib: {
          tribMun: {
            tribISSQN: '1',
            pAliq: 0,
            tpRetISSQN: '1'
          }
        }
      }
    }
  });

  // Carregar template XML na inicialização
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setTemplateLoading(true);
        const templateData = await loadXMLTemplate();
        setFormData(templateData);
      } catch (error) {
        console.error('Erro ao carregar template:', error);
        setError('Erro ao carregar template XML. Usando dados padrão.');
      } finally {
        setTemplateLoading(false);
      }
    };

    loadTemplate();
  }, []);

  // Função para resetar o formulário com dados do template
  const resetForm = async () => {
    try {
      setTemplateLoading(true);
      const templateData = await loadXMLTemplate();
      setFormData(templateData);
      setError('');
    } catch (error) {
      console.error('Erro ao resetar formulário:', error);
      setError('Erro ao carregar template XML.');
    } finally {
      setTemplateLoading(false);
    }
  };

  const updateFormData = (section: keyof CompleteDPSData['infDPS'], data: any) => {
    setFormData(prev => ({
      ...prev,
      infDPS: {
        ...prev.infDPS,
        [section]: data
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Importa o gerador dinamicamente para evitar problemas de SSR
      const { CompleteNFSeGenerator } = await import('../../lib/nfse/completeGenerator');
      const generator = new CompleteNFSeGenerator();
      
      // Gera o XML da DPS completo
      const xml = generator.generateDPSXML(formData);
      
      onXMLGenerated(xml);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar XML');
      console.error('Erro detalhado:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verificar se intermediário deve ser mostrado
  const showIntermediario = formData.infDPS.tpEmit === '3';

  const tabs = [
    {
      id: 'dados-gerais',
      label: 'Dados Gerais',
      content: (
        <DadosGeraisForm
          data={formData.infDPS}
          onChange={(data) => {
            setFormData(prev => ({
              ...prev,
              infDPS: {
                ...prev.infDPS,
                ...data
              }
            }));
          }}
        />
      )
    },
    {
      id: 'prestador',
      label: 'Prestador',
      content: (
        <PrestadorForm
          data={formData.infDPS.prest}
          onChange={(data) => updateFormData('prest', data)}
        />
      )
    },
    {
      id: 'tomador',
      label: 'Tomador',
      content: (
        <TomadorForm
          data={formData.infDPS.toma}
          onChange={(data) => updateFormData('toma', data)}
        />
      )
    },
    {
      id: 'intermediario',
      label: 'Intermediário',
      content: showIntermediario ? (
        <IntermediarioForm
          data={formData.infDPS.interm || {
            xNome: '',
            end: {
              endNac: { cMun: '', CEP: '' },
              xLgr: '',
              nro: '',
              xBairro: ''
            }
          }}
          onChange={(data) => updateFormData('interm', data)}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Intermediário aparece apenas quando Tipo de Emitente = &quot;Intermediário&quot;</p>
          <p className="text-sm mt-2">Configure em Dados Gerais → Tipo de Emitente</p>
        </div>
      ),
      disabled: !showIntermediario
    },
    {
      id: 'servicos',
      label: 'Serviços',
      content: (
        <ServicosForm
          data={formData.infDPS.serv}
          onChange={(data) => updateFormData('serv', data)}
        />
      )
    },
    {
      id: 'valores',
      label: 'Valores e Tributação',
      content: (
        <ValoresForm
          data={formData.infDPS.valores}
          onChange={(data) => updateFormData('valores', data)}
        />
      )
    }
  ];

  // Mostrar loading enquanto carrega o template
  if (templateLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando template XML...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao processar</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} defaultTab="dados-gerais" />

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            if (confirm('Deseja resetar o formulário com os dados do template?')) {
              resetForm();
            }
          }}
          disabled={templateLoading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {templateLoading ? 'Carregando...' : 'Resetar com Template'}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Gerando XML...' : 'Gerar XML'}
        </button>
      </div>
    </form>
  );
}