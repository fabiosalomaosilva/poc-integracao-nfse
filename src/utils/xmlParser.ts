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
  const servicosElement = infDPS.querySelector('servicos');
  const servicos: any = {
    locPrest: {
      cLocPrestacao: getText('cLocPrestacao', servicosElement || undefined),
      cPaisPrestacao: getText('cPaisPrestacao', servicosElement || undefined),
      opConsumServ: getText('opConsumServ', servicosElement || undefined)
    },
    cServ: {
      cTribNac: getText('cTribNac', servicosElement || undefined),
      cTribMun: getText('cTribMun', servicosElement || undefined),
      cNBS: getText('cNBS', servicosElement || undefined),
      cIntContrib: getText('cIntContrib', servicosElement || undefined),
      xDescServ: getText('xDescServ', servicosElement || undefined)
    }
  };

  // Extrair especialidades do serviço (comércio exterior, locação, obra, etc.)
  const comExtElement = servicosElement?.querySelector('comExt');
  if (comExtElement) {
    servicos.comExt = {
      mdPrestacao: getText('mdPrestacao', comExtElement || undefined),
      vincPrest: getText('vincPrest', comExtElement || undefined),
      tpMoeda: getText('tpMoeda', comExtElement || undefined),
      vServMoeda: getNumber('vServMoeda', comExtElement || undefined),
      mecApoioFomento: getText('mecApoioFomento', comExtElement || undefined),
      mdic: getText('mdic', comExtElement || undefined),
      nroDI: getText('nroDI', comExtElement || undefined),
      nroRE: getText('nroRE', comExtElement || undefined)
    };
  }

  // Extrair valores e tributação
  const valoresElement = infDPS.querySelector('valores');
  const valores: any = {
    vServPrest: {
      vServ: getNumber('vServ', valoresElement || undefined),
      vReceb: getNumber('vReceb', valoresElement || undefined)
    },
    vLiq: getNumber('vLiq', valoresElement || undefined),
    trib: {
      tribMun: {
        tribISSQN: getText('tribISSQN', valoresElement || undefined),
        pAliq: getNumber('pAliq', valoresElement || undefined),
        vBC: getNumber('vBC', valoresElement || undefined),
        vISS: getNumber('vISS', valoresElement || undefined),
        tpRetISSQN: getText('tpRetISSQN', valoresElement || undefined) || '1',
        cPaisResult: getText('cPaisResult', valoresElement || undefined),
        tpImunidade: getText('tpImunidade', valoresElement || undefined)
      }
    }
  };

  // Extrair descontos se existirem
  const vDescIncond = getNumber('vDescIncond', valoresElement || undefined);
  const vDescCond = getNumber('vDescCond', valoresElement || undefined);
  if (vDescIncond > 0 || vDescCond > 0) {
    valores.vDescCondIncond = {
      vDescIncond,
      vDescCond
    };
  }

  // Extrair deduções se existirem
  const pDR = getNumber('pDR', valoresElement || undefined);
  const vDR = getNumber('vDR', valoresElement || undefined);
  if (pDR > 0 || vDR > 0) {
    valores.vDedRed = {
      pDR: pDR > 0 ? pDR : undefined,
      vDR: vDR > 0 ? vDR : undefined
    };
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
    const servicos = xmlDoc.querySelector('servicos');
    const valores = xmlDoc.querySelector('valores');

    if (!prest) return { valid: false, error: 'Dados do prestador não encontrados' };
    if (!toma) return { valid: false, error: 'Dados do tomador não encontrados' };
    if (!servicos) return { valid: false, error: 'Dados dos serviços não encontrados' };
    if (!valores) return { valid: false, error: 'Dados dos valores não encontrados' };

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Erro ao processar XML: ' + (error as Error).message };
  }
}