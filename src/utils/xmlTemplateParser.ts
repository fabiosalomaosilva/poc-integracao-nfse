// Utilitário para parsear o template XML e converter para dados do formulário

import { CompleteDPSData } from '../types/nfse/complete';

// Função para extrair texto de um elemento XML
function getTextContent(xmlString: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)<\/${tagName}>`, 'i');
  const match = xmlString.match(regex);
  return match ? match[1].trim() : '';
}

// Função para parsear número ou retornar undefined se vazio
function parseFloatOrUndefined(value: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
}

// Função para parsear o template XML e converter para dados do formulário
export function parseXMLTemplate(xmlContent: string): CompleteDPSData {
  try {
    // Remover quebras de linha e espaços extras
    const cleanXml = xmlContent.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

    // Extrair dados do DPS (Documento Primário de Serviços)
    const templateData: CompleteDPSData = {
      versao: '1.00',
      infDPS: {
        Id: 'DPS00',
        tpAmb: (getTextContent(cleanXml, 'tpAmb') || '2') as '1' | '2', // Ambiente de teste por padrão
        dhEmi: getTextContent(cleanXml, 'dhEmi') || new Date().toISOString(),
        verAplic: getTextContent(cleanXml, 'verAplic') || '1.00',
        serie: getTextContent(cleanXml, 'serie') || '00001',
        nDPS: getTextContent(cleanXml, 'nDPS') || '1',
        dCompet: getTextContent(cleanXml, 'dCompet') || new Date().toISOString().slice(0, 10),
        tpEmit: (getTextContent(cleanXml, 'tpEmit') || '1') as '1' | '2' | '3',
        cLocEmi: getTextContent(cleanXml, 'cLocEmi') || '',

        // Prestador
        prest: {
          CNPJ: getTextContent(cleanXml, 'CNPJ') || '',
          IM: getTextContent(cleanXml, 'IM') || '',
          xNome: '',
          xFant: '',
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
            opSimpNac: (getTextContent(cleanXml, 'opSimpNac') || '1') as '1' | '2' | '3',
            regEspTrib: getTextContent(cleanXml, 'regEspTrib') || '0'
          }
        },

        // Tomador
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

        // Serviços
        serv: {
          locPrest: {
            cLocPrestacao: getTextContent(cleanXml, 'cLocPrestacao') || ''
          },
          cServ: {
            cTribNac: getTextContent(cleanXml, 'cTribNac') || '',
            xDescServ: getTextContent(cleanXml, 'xDescServ') || ''
          }
        },

        // Valores
        valores: {
          vServPrest: {
            vServ: parseFloat(getTextContent(cleanXml, 'vServ')) || 0,
            ...(parseFloatOrUndefined(getTextContent(cleanXml, 'vReceb')) !== undefined && {
              vReceb: parseFloatOrUndefined(getTextContent(cleanXml, 'vReceb'))
            })
          },
          ...(parseFloatOrUndefined(getTextContent(cleanXml, 'vDescIncond')) !== undefined || 
              parseFloatOrUndefined(getTextContent(cleanXml, 'vDescCond')) !== undefined ? {
            vDescCondIncond: {
              ...(parseFloatOrUndefined(getTextContent(cleanXml, 'vDescIncond')) !== undefined && {
                vDescIncond: parseFloatOrUndefined(getTextContent(cleanXml, 'vDescIncond'))
              }),
              ...(parseFloatOrUndefined(getTextContent(cleanXml, 'vDescCond')) !== undefined && {
                vDescCond: parseFloatOrUndefined(getTextContent(cleanXml, 'vDescCond'))
              })
            }
          } : {}),
          ...(parseFloatOrUndefined(getTextContent(cleanXml, 'vDR')) !== undefined ? {
            vDedRed: {
              vDR: parseFloatOrUndefined(getTextContent(cleanXml, 'vDR'))
            }
          } : {}),
          trib: {
            tribMun: {
              tribISSQN: (getTextContent(cleanXml, 'tribISSQN') || '1') as '1' | '2' | '3' | '4',
              pAliq: parseFloat(getTextContent(cleanXml, 'pAliq')) || 0,
              tpRetISSQN: (getTextContent(cleanXml, 'tpRetISSQN') || '1') as '1' | '2'
            },
            tribFed: {
              piscofins: {
                CST: getTextContent(cleanXml, 'CST') || '00',
                ...(parseFloatOrUndefined(getTextContent(cleanXml, 'vBCPisCofins')) !== undefined && {
                  vBCPisCofins: parseFloatOrUndefined(getTextContent(cleanXml, 'vBCPisCofins'))
                }),
                ...(parseFloatOrUndefined(getTextContent(cleanXml, 'vPis')) !== undefined && {
                  vPis: parseFloatOrUndefined(getTextContent(cleanXml, 'vPis'))
                }),
                ...(parseFloatOrUndefined(getTextContent(cleanXml, 'vCofins')) !== undefined && {
                  vCofins: parseFloatOrUndefined(getTextContent(cleanXml, 'vCofins'))
                })
              },
              ...(parseFloatOrUndefined(getTextContent(cleanXml, 'vRetCP')) !== undefined && {
                vRetCP: parseFloatOrUndefined(getTextContent(cleanXml, 'vRetCP'))
              }),
              ...(parseFloatOrUndefined(getTextContent(cleanXml, 'vRetIRRF')) !== undefined && {
                vRetIRRF: parseFloatOrUndefined(getTextContent(cleanXml, 'vRetIRRF'))
              }),
              ...(parseFloatOrUndefined(getTextContent(cleanXml, 'vRetCSLL')) !== undefined && {
                vRetCSLL: parseFloatOrUndefined(getTextContent(cleanXml, 'vRetCSLL'))
              })
            },
            totTrib: {
              vTotTrib: {
                vTotTribFed: parseFloat(getTextContent(cleanXml, 'vTotTribFed')) || 0,
                vTotTribEst: parseFloat(getTextContent(cleanXml, 'vTotTribEst')) || 0,
                vTotTribMun: parseFloat(getTextContent(cleanXml, 'vTotTribMun')) || 0
              }
            }
          }
        }
      }
    };

    // Extrair dados específicos do prestador do XML
    const prestRegex = /<prest>(.*?)<\/prest>/i;
    const prestMatch = cleanXml.match(prestRegex);
    if (prestMatch) {
      const prestXml = prestMatch[1];
      templateData.infDPS.prest.CNPJ = getTextContent(prestXml, 'CNPJ');
      templateData.infDPS.prest.IM = getTextContent(prestXml, 'IM');
      templateData.infDPS.prest.xNome = getTextContent(prestXml, 'xNome');
      
      // Endereço do prestador
      templateData.infDPS.prest.end.xLgr = getTextContent(prestXml, 'xLgr');
      templateData.infDPS.prest.end.nro = getTextContent(prestXml, 'nro');
      templateData.infDPS.prest.end.xCpl = getTextContent(prestXml, 'xCpl');
      templateData.infDPS.prest.end.xBairro = getTextContent(prestXml, 'xBairro');
      templateData.infDPS.prest.end.endNac!.cMun = getTextContent(prestXml, 'cMun');
      templateData.infDPS.prest.end.endNac!.CEP = getTextContent(prestXml, 'CEP');
    }

    // Extrair dados específicos do tomador do XML
    const tomaRegex = /<toma>(.*?)<\/toma>/i;
    const tomaMatch = cleanXml.match(tomaRegex);
    if (tomaMatch) {
      const tomaXml = tomaMatch[1];
      templateData.infDPS.toma.CNPJ = getTextContent(tomaXml, 'CNPJ');
      templateData.infDPS.toma.xNome = getTextContent(tomaXml, 'xNome');
      
      // Endereço do tomador
      templateData.infDPS.toma.end.xLgr = getTextContent(tomaXml, 'xLgr');
      templateData.infDPS.toma.end.nro = getTextContent(tomaXml, 'nro');
      templateData.infDPS.toma.end.xBairro = getTextContent(tomaXml, 'xBairro');
      templateData.infDPS.toma.end.endNac!.cMun = getTextContent(tomaXml, 'cMun');
      templateData.infDPS.toma.end.endNac!.CEP = getTextContent(tomaXml, 'CEP');
    }

    return templateData;

  } catch (error) {
    console.error('Erro ao parsear template XML:', error);
    
    // Retornar dados padrão em caso de erro
    return getDefaultFormData();
  }
}

// Função para obter dados padrão quando não há template ou ocorre erro
function getDefaultFormData(): CompleteDPSData {
  return {
    versao: '1.00',
    infDPS: {
      Id: 'DPS00',
      tpAmb: '2',
      dhEmi: new Date().toISOString(),
      verAplic: '1.00',
      serie: '00001',
      nDPS: '1',
      dCompet: new Date().toISOString().slice(0, 10),
      tpEmit: '1',
      cLocEmi: '',
      prest: {
        CNPJ: '',
        IM: '',
        xNome: '',
        xFant: '',
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
          opSimpNac: '1' as '1' | '2' | '3',
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
            tribISSQN: '1' as '1' | '2' | '3' | '4',
            pAliq: 0,
            tpRetISSQN: '1' as '1' | '2'
          },
          tribFed: {
            piscofins: {
              CST: '00'
            }
          },
          totTrib: {
            vTotTrib: {
              vTotTribFed: 0,
              vTotTribEst: 0,
              vTotTribMun: 0
            }
          }
        }
      }
    }
  };
}

// Função para carregar o template XML
export async function loadXMLTemplate(): Promise<CompleteDPSData> {
  try {
    // Tentar carregar o arquivo de template
    const response = await fetch('/XSDs/data/template.xml');
    if (!response.ok) {
      console.warn('Template XML não encontrado, usando dados padrão');
      return getDefaultFormData();
    }

    const xmlContent = await response.text();
    return parseXMLTemplate(xmlContent);

  } catch (error) {
    console.error('Erro ao carregar template XML:', error);
    return getDefaultFormData();
  }
}