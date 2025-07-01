// Utilitário para fazer parse de XML NFSe e extrair dados para o formulário

import { CompleteDPSData } from '../types/nfse/complete';

/**
 * Faz parse de XML NFSe e converte para estrutura do formulário
 */
export function parseNFSeXML(xmlContent: string): CompleteDPSData {
  // Parse básico do XML
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  
  // Verificar se há erros de parse
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('XML inválido: ' + parseError.textContent);
  }

  // Função auxiliar para extrair texto de um elemento
  const getText = (selector: string, parent?: Element | Document | null): string => {
    if (!parent) return '';
    const element = parent.querySelector(selector);
    return element?.textContent?.trim() || '';
  };

  // Função auxiliar para extrair número
  const getNumber = (selector: string, parent?: Element | Document | null): number => {
    const text = getText(selector, parent);
    return text ? parseFloat(text) : 0;
  };

  // Extrair dados principais da DPS
  const infDPS = xmlDoc.querySelector('infDPS');
  if (!infDPS) {
    throw new Error('Elemento infDPS não encontrado no XML');
  }

  // Extrair dados gerais
  const id = getText('Id', infDPS) || '';
  const tpAmb = getText('tpAmb', infDPS) || '2';
  const dhEmi = getText('dhEmi', infDPS) || '';
  const verAplic = getText('verAplic', infDPS) || '1.00';
  const serie = getText('serie', infDPS) || '';
  const nDPS = getText('nDPS', infDPS) || '';
  const dCompet = getText('dCompet', infDPS) || '';
  const tpEmit = getText('tpEmit', infDPS) || '1';
  const cLocEmi = getText('cLocEmi', infDPS) || '';

  // Extrair dados do prestador
  const prestElement = infDPS.querySelector('prest');
  const prest = {
    CNPJ: getText('CNPJ', prestElement || undefined),
    IM: getText('IM', prestElement || undefined),
    xNome: getText('xNome', prestElement || undefined),
    xFant: getText('xFant', prestElement || undefined),
    end: {
      endNac: {
        cMun: getText('cMun', prestElement || undefined),
        CEP: getText('CEP', prestElement || undefined)
      },
      xLgr: getText('xLgr', prestElement || undefined),
      nro: getText('nro', prestElement || undefined),
      xCpl: getText('xCpl', prestElement || undefined),
      xBairro: getText('xBairro', prestElement || undefined)
    },
    fone: getText('fone', prestElement || undefined),
    email: getText('email', prestElement || undefined),
    regTrib: {
      opSimpNac: (getText('opSimpNac', prestElement || undefined) || '1') as '1' | '2' | '3',
      regEspTrib: (getText('regEspTrib', prestElement || undefined) || '0') as '0' | '1' | '2' | '3' | '4' | '5' | '6'
    }
  };

  // Extrair dados do tomador
  const tomaElement = infDPS.querySelector('toma');
  const toma = {
    CNPJ: getText('CNPJ', tomaElement || undefined),
    CPF: getText('CPF', tomaElement || undefined),
    IM: getText('IM', tomaElement || undefined),
    xNome: getText('xNome', tomaElement || undefined),
    end: {
      endNac: {
        cMun: getText('cMun', tomaElement || undefined),
        CEP: getText('CEP', tomaElement || undefined)
      },
      xLgr: getText('xLgr', tomaElement || undefined),
      nro: getText('nro', tomaElement || undefined),
      xCpl: getText('xCpl', tomaElement || undefined),
      xBairro: getText('xBairro', tomaElement || undefined)
    },
    fone: getText('fone', tomaElement || undefined),
    email: getText('email', tomaElement || undefined)
  };

  // Extrair dados do intermediário (se existir)
  const intermElement = infDPS.querySelector('interm');
  let interm;
  if (intermElement) {
    interm = {
      CNPJ: getText('CNPJ', intermElement || undefined),
      CPF: getText('CPF', intermElement || undefined),
      IM: getText('IM', intermElement || undefined),
      xNome: getText('xNome', intermElement || undefined),
      end: {
        endNac: {
          cMun: getText('cMun', intermElement || undefined),
          CEP: getText('CEP', intermElement || undefined)
        },
        xLgr: getText('xLgr', intermElement || undefined),
        nro: getText('nro', intermElement || undefined),
        xCpl: getText('xCpl', intermElement || undefined),
        xBairro: getText('xBairro', intermElement || undefined)
      }
    };
  }

  // Extrair dados dos serviços
  const servElement = infDPS.querySelector('serv');
  const locPrestElement = servElement?.querySelector('locPrest');
  const cServElement = servElement?.querySelector('cServ');
  
  const servicos: any = {
    locPrest: {
      cLocPrestacao: getText('cLocPrestacao', locPrestElement || undefined),
      cPaisPrestacao: getText('cPaisPrestacao', locPrestElement || undefined),
      opConsumServ: getText('opConsumServ', locPrestElement || undefined)
    },
    cServ: {
      cTribNac: getText('cTribNac', cServElement || undefined),
      cTribMun: getText('cTribMun', cServElement || undefined),
      cNBS: getText('cNBS', cServElement || undefined),
      cIntContrib: getText('cIntContrib', cServElement || undefined),
      xDescServ: getText('xDescServ', cServElement || undefined)
    }
  };

  // Extrair especialidades do serviço (comércio exterior, locação, obra, etc.)
  const comExtElement = servElement?.querySelector('comExt');
  if (comExtElement) {
    servicos.comExt = {
      mdPrestacao: getText('mdPrestacao', comExtElement || undefined),
      vincPrest: getText('vincPrest', comExtElement || undefined),
      tpMoeda: getText('tpMoeda', comExtElement || undefined),
      vServMoeda: getNumber('vServMoeda', comExtElement || undefined),
      mecAFComexP: getText('mecAFComexP', comExtElement || undefined),
      mecAFComexT: getText('mecAFComexT', comExtElement || undefined),
      movTempBens: getText('movTempBens', comExtElement || undefined),
      mdic: getText('mdic', comExtElement || undefined),
      nroDI: getText('nroDI', comExtElement || undefined),
      nroRE: getText('nroRE', comExtElement || undefined)
    };
  }

  // Extrair valores e tributação
  const valoresElement = infDPS.querySelector('valores');
  const vServPrestElement = valoresElement?.querySelector('vServPrest');
  const vDescCondIncondElement = valoresElement?.querySelector('vDescCondIncond');
  const vDedRedElement = valoresElement?.querySelector('vDedRed');
  const tribElement = valoresElement?.querySelector('trib');
  const tribMunElement = tribElement?.querySelector('tribMun');
  
  // Extrair tributação federal e total de tributos
  const tribFedElement = tribElement?.querySelector('tribFed');
  const piscofinElement = tribFedElement?.querySelector('piscofins');
  const totTribElement = tribElement?.querySelector('totTrib');
  const vTotTribElement = totTribElement?.querySelector('vTotTrib');

  const valores: any = {
    vServPrest: {
      vServ: getNumber('vServ', vServPrestElement || undefined),
      vReceb: getNumber('vReceb', vServPrestElement || undefined)
    },
    vLiq: getNumber('vLiq', valoresElement || undefined),
    trib: {
      tribMun: {
        tribISSQN: getText('tribISSQN', tribMunElement || undefined) || '1',
        pAliq: getNumber('pAliq', tribMunElement || undefined),
        vBC: getNumber('vBC', tribMunElement || undefined),
        vISS: getNumber('vISS', tribMunElement || undefined),
        tpRetISSQN: getText('tpRetISSQN', tribMunElement || undefined) || '1',
        cPaisResult: getText('cPaisResult', tribMunElement || undefined),
        tpImunidade: getText('tpImunidade', tribMunElement || undefined)
      },
      tribFed: {
        piscofins: {
          CST: getText('CST', piscofinElement || undefined) || '00',
          vBCPisCofins: getNumber('vBCPisCofins', piscofinElement || undefined),
          pAliqPis: getNumber('pAliqPis', piscofinElement || undefined),
          pAliqCofins: getNumber('pAliqCofins', piscofinElement || undefined),
          vPis: getNumber('vPis', piscofinElement || undefined),
          vCofins: getNumber('vCofins', piscofinElement || undefined),
          tpRetPisCofins: getText('tpRetPisCofins', piscofinElement || undefined)
        },
        vRetCP: getNumber('vRetCP', tribFedElement || undefined),
        vRetIRRF: getNumber('vRetIRRF', tribFedElement || undefined),
        vRetCSLL: getNumber('vRetCSLL', tribFedElement || undefined)
      },
      totTrib: {
        vTotTrib: {
          vTotTribFed: getNumber('vTotTribFed', vTotTribElement || undefined),
          vTotTribEst: getNumber('vTotTribEst', vTotTribElement || undefined),
          vTotTribMun: getNumber('vTotTribMun', vTotTribElement || undefined)
        }
      }
    }
  };

  // Extrair descontos se existirem
  if (vDescCondIncondElement) {
    const vDescIncond = getNumber('vDescIncond', vDescCondIncondElement);
    const vDescCond = getNumber('vDescCond', vDescCondIncondElement);
    if (vDescIncond > 0 || vDescCond > 0) {
      valores.vDescCondIncond = {
        vDescIncond,
        vDescCond
      };
    }
  }

  // Extrair deduções se existirem
  if (vDedRedElement) {
    const pDR = getNumber('pDR', vDedRedElement);
    const vDR = getNumber('vDR', vDedRedElement);
    if (pDR > 0 || vDR > 0) {
      valores.vDedRed = {
        pDR: pDR > 0 ? pDR : undefined,
        vDR: vDR > 0 ? vDR : undefined
      };
    }
  }

  // Montar estrutura completa
  const formData: CompleteDPSData = {
    versao: '1.00',
    infDPS: {
      Id: id,
      tpAmb: tpAmb as '1' | '2',
      dhEmi,
      verAplic,
      serie,
      nDPS,
      dCompet,
      tpEmit: tpEmit as '1' | '2' | '3',
      cLocEmi,
      prest,
      toma,
      serv: servicos,
      valores
    }
  };

  // Adicionar intermediário se existir
  if (interm && tpEmit === '3') {
    formData.infDPS.interm = interm;
  }

  return formData;
}

/**
 * Valida se o XML é um NFSe válido
 */
export function validateNFSeXML(xmlContent: string): { valid: boolean; error?: string } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      return { valid: false, error: 'XML malformado: ' + parseError.textContent };
    }

    // Verificar se contém elementos essenciais
    const infDPS = xmlDoc.querySelector('infDPS');
    if (!infDPS) {
      return { valid: false, error: 'XML não contém elemento infDPS (não é um NFSe válido)' };
    }

    const prest = xmlDoc.querySelector('prest');
    const toma = xmlDoc.querySelector('toma');
    const serv = xmlDoc.querySelector('serv');
    const valores = xmlDoc.querySelector('valores');

    if (!prest) return { valid: false, error: 'Dados do prestador não encontrados' };
    if (!toma) return { valid: false, error: 'Dados do tomador não encontrados' };
    if (!serv) return { valid: false, error: 'Dados dos serviços não encontrados' };
    if (!valores) return { valid: false, error: 'Dados dos valores não encontrados' };

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Erro ao processar XML: ' + (error as Error).message };
  }
}