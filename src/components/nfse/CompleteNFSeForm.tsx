'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNFSeFormState } from '../../hooks/usePersistentState';
import Tabs from '../ui/Tabs';
import DadosGeraisForm from './forms/DadosGeraisForm';
import PrestadorForm from './forms/PrestadorForm';
import TomadorForm from './forms/TomadorForm';
import IntermediarioForm from './forms/IntermediarioForm';
import ServicosForm from './forms/ServicosForm';
import ValoresForm from './forms/ValoresForm';
import { CompleteDPSData, CompleteNFSeData } from '../../types/nfse/complete';
import { loadXMLTemplate } from '../../utils/xmlTemplateParser';
import { getCurrentBrazilDateTime } from '../../utils/dateTimeUtils';
import XMLUploader from '../ui/XMLUploader';
import { 
  FiUpload, 
  FiFileText, 
  FiUser, 
  FiUsers, 
  FiUserCheck, 
  FiSettings, 
  FiDollarSign 
} from 'react-icons/fi';
//import { getSavedDataPreview } from '../../hooks/usePersistentState';

interface CompleteNFSeFormProps {
  onXMLGenerated: (xml: string) => void;
}

export default function CompleteNFSeForm({ onXMLGenerated }: CompleteNFSeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [templateLoading, setTemplateLoading] = useState(true);

  // Estado inicial do formulário
  const initialFormData: CompleteDPSData = {
    versao: '1.00',
    infDPS: {
      Id: '',
      tpAmb: '2', // Homologação por padrão
      dhEmi: getCurrentBrazilDateTime(),
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
  };

  // Estado do formulário com persistência
  const { state: formData, setState: setFormData, isLoaded, clearPersistentState, resetWithData } = useNFSeFormState(initialFormData);

  // Carregar template XML apenas na inicialização 
  useEffect(() => {
    if (!isLoaded) return;

    const loadTemplate = async () => {
      try {
        setTemplateLoading(true);

        // Verificar se é a primeira vez que carrega (sem dados no localStorage)
        const hasFormData = formData.infDPS.prest.xNome || formData.infDPS.toma.xNome || formData.infDPS.prest.CNPJ;

        if (!hasFormData) {
          const templateData = await loadXMLTemplate();
          setFormData(templateData);
        }
      } catch (error) {
        console.error('Erro ao carregar template:', error);
        setError('Erro ao carregar template XML. Usando dados padrão.');
      } finally {
        setTemplateLoading(false);
      }
    };

    loadTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]); // Apenas quando isLoaded muda

  // Função para resetar o formulário e limpar dados persistentes
  const resetForm = async () => {
    try {
      setTemplateLoading(true);
      clearPersistentState(); // Limpa dados do localStorage
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

  const updateFormData = useCallback((section: keyof CompleteDPSData['infDPS'], data: any) => {
    setFormData(prev => ({
      ...prev,
      infDPS: {
        ...prev.infDPS,
        [section]: data
      }
    }));
  }, [setFormData]);

  // Função para carregar XML e popular formulário
  const handleXMLLoad = useCallback((xmlData: CompleteDPSData) => {
    resetWithData(xmlData); // Usa resetWithData para sobrescrever dados persistentes
    setError('');
    console.log('XML carregado e formulário atualizado:', xmlData);
  }, [resetWithData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Importa o gerador dinamicamente para evitar problemas de SSR
      const { CompleteNFSeGenerator } = await import('../../lib/nfse/completeGenerator');
      const generator = new CompleteNFSeGenerator();

      // Converte dados DPS para NFSe completa
      const nfseData = convertDPSToCompleteNFSe(formData);

      // Gera o XML da NFSe completa
      const xml = generator.generateCompleteNFSeXML(nfseData);

      onXMLGenerated(xml);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar XML');
      console.error('Erro detalhado:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para converter dados DPS para NFSe completa
  const convertDPSToCompleteNFSe = (dpsData: CompleteDPSData): CompleteNFSeData => {
    return {
      versao: '1.00',
      infNFSe: {
        Id: 'NSF00',
        xLocEmi: 'Regente Feijó', // Valor do template
        xLocPrestacao: 'Regente Feijó', // Valor do template
        nNFSe: '1',
        cLocIncid: dpsData.infDPS.cLocEmi,
        xLocIncid: 'Regente Feijó',
        xTribNac: dpsData.infDPS.serv?.cServ?.xDescServ || '',
        xTribMun: dpsData.infDPS.serv?.cServ?.xDescServ?.substring(0, 40) || '',
        verAplic: '1.00',
        ambGer: '1',
        tpEmis: '2',
        cStat: '100',
        dhProc: new Date().toISOString(),
        nDFSe: '1',
        emit: {
          ...(dpsData.infDPS.prest?.CNPJ ? { CNPJ: dpsData.infDPS.prest.CNPJ } : {}),
          ...(dpsData.infDPS.prest?.CPF ? { CPF: dpsData.infDPS.prest.CPF } : {}),
          IM: dpsData.infDPS.prest?.IM || '4292',
          xNome: dpsData.infDPS.prest?.xNome || 'Empresa de Teste 01',
          xFant: dpsData.infDPS.prest?.xFant || 'Empresa de Teste 01',
          enderNac: {
            xLgr: dpsData.infDPS.prest?.end?.xLgr || 'AV. ATILIO ALBERTINI',
            nro: dpsData.infDPS.prest?.end?.nro || '0',
            xCpl: dpsData.infDPS.prest?.end?.xCpl || 'S/N - PARTE',
            xBairro: dpsData.infDPS.prest?.end?.xBairro || 'DISTRITO INDUSTRIAL',
            cMun: dpsData.infDPS.prest?.end?.endNac?.cMun || '3542404',
            UF: 'SP',
            CEP: dpsData.infDPS.prest?.end?.endNac?.CEP || '19570000'
          },
          fone: dpsData.infDPS.prest?.fone || '1832296800',
          email: dpsData.infDPS.prest?.email || 'teste@teste.com.br'
        },
        valores: {
          vCalcDR: 0.00,
          vCalcBM: 0.00,
          vBC: dpsData.infDPS.valores?.vServPrest?.vServ || 0,
          pAliqAplic: dpsData.infDPS.valores?.trib?.tribMun?.pAliq || 0,
          vISSQN: (dpsData.infDPS.valores?.vServPrest?.vServ || 0) * (dpsData.infDPS.valores?.trib?.tribMun?.pAliq || 0) / 100,
          vTotalRet: 0.00,
          vLiq: dpsData.infDPS.valores?.vServPrest?.vServ || 0
        },
        DPS: dpsData
      }
    };
  };


  const tabs = [
    {
      id: 'upload-xml',
      label: (
        <span className="flex items-center gap-2">
          <FiUpload className="w-4 h-4" />
          Carregar XML
        </span>
      ),
      content: (
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Carregar XML Existente</h3>
            <p className="text-sm text-gray-600">
              Faça upload de um arquivo XML de NFSe existente para editar seus dados.
              Todos os formulários serão preenchidos automaticamente com as informações do XML.
            </p>
          </div>
          <XMLUploader onXMLParsed={handleXMLLoad} />
        </div>
      )
    },
    {
      id: 'dados-gerais',
      label: (
        <span className="flex items-center gap-2">
          <FiFileText className="w-4 h-4" />
          Dados Gerais
        </span>
      ),
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
      label: (
        <span className="flex items-center gap-2">
          <FiUser className="w-4 h-4" />
          Prestador
        </span>
      ),
      content: (
        <PrestadorForm
          data={formData.infDPS.prest}
          onChange={(data) => updateFormData('prest', data)}
        />
      )
    },
    {
      id: 'tomador',
      label: (
        <span className="flex items-center gap-2">
          <FiUsers className="w-4 h-4" />
          Tomador
        </span>
      ),
      content: (
        <TomadorForm
          data={formData.infDPS.toma}
          onChange={(data) => updateFormData('toma', data)}
        />
      )
    },
    {
      id: 'intermediario',
      label: (
        <span className="flex items-center gap-2">
          <FiUserCheck className="w-4 h-4" />
          Intermediário
        </span>
      ),
      content: (
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
      )
    },
    {
      id: 'servicos',
      label: (
        <span className="flex items-center gap-2">
          <FiSettings className="w-4 h-4" />
          Serviços
        </span>
      ),
      content: (
        <ServicosForm
          data={formData.infDPS.serv}
          onChange={(data) => updateFormData('serv', data)}
        />
      )
    },
    {
      id: 'valores',
      label: (
        <span className="flex items-center gap-2">
          <FiDollarSign className="w-4 h-4" />
          Valores e Tributação
        </span>
      ),
      content: (
        <ValoresForm
          data={formData.infDPS.valores}
          onChange={(data) => updateFormData('valores', { ...formData.infDPS.valores, ...data })}
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

  // Verificar se há dados salvos para mostrar aviso
  //const savedDataInfo = getSavedDataPreview();

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
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              if (confirm('Deseja resetar o formulário? Todos os dados preenchidos serão perdidos e o formulário voltará aos dados do template.')) {
                resetForm();
              }
            }}
            disabled={templateLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {templateLoading ? 'Carregando...' : 'Resetar Formulário'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Gerando XML...' : 'Gerar XML'}
          </button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          💡 Os dados do formulário são salvos automaticamente no navegador. Use "Resetar Formulário" para limpar todos os dados.
        </div>
      </div>
    </form>
  );
}