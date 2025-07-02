import { XMLProcessor } from '../../utils/xml/parser';
import { NFSeValidator } from '../../utils/xml/validator';
import { NFSeData, DPSData, PrestadorData, TomadorData, EnderecoData, ContatoData, ServicoData, ValoresData } from '../../types/nfse';
import { XMLElement } from '../../types/nfse/xml';

export class NFSeGenerator {
  private xmlProcessor: XMLProcessor;
  private validator: NFSeValidator;

  constructor() {
    this.xmlProcessor = new XMLProcessor();
    this.validator = new NFSeValidator();
  }

  generateNFSeXML(data: NFSeData): string {
    const validation = this.validator.validateNFSe(data);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }

    const nfseObj = {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8'
      },
      NFSe: {
        '@_xmlns': 'http://www.sped.fazenda.gov.br/nfse',
        '@_versao': data.versao,
        infNFSe: {
          '@_Id': `NFSe${data.infNFSe.nNFSe || ''}`,
          xLocEmi: data.infNFSe.xLocEmi,
          xLocPrestacao: data.infNFSe.xLocPrestacao,
          ...(data.infNFSe.nNFSe && { nNFSe: data.infNFSe.nNFSe }),
          ...(data.infNFSe.cLocIncid && { cLocIncid: data.infNFSe.cLocIncid }),
          dhEmi: data.infNFSe.dhEmi,
          cNatOp: data.infNFSe.cNatOp,
          cRegTrib: data.infNFSe.cRegTrib,
          xRegTrib: data.infNFSe.xRegTrib,
          optSimpNac: data.infNFSe.optSimpNac,
          dCompet: data.infNFSe.dCompet,
          prest: this.buildPrestadorXML(data.infNFSe.prestador),
          tomador: this.buildTomadorXML(data.infNFSe.tomador),
          serv: this.buildServicoXML(data.infNFSe.servico),
          valores: this.buildValoresXML(data.infNFSe.valores)
        }
      }
    };

    return this.xmlProcessor.buildXML(nfseObj);
  }

  generateDPSXML(data: DPSData): string {
    const validation = this.validator.validateDPS(data);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }

    const dpsObj = {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8'
      },
      DPS: {
        '@_xmlns': 'http://www.sped.fazenda.gov.br/nfse',
        '@_versao': data.versao,
        infDPS: {
          '@_Id': `DPS${Date.now()}`,
          prest: this.buildPrestadorXML(data.infDPS.prestador),
          tomador: this.buildTomadorXML(data.infDPS.tomador),
          serv: this.buildServicoXML(data.infDPS.servico),
          valores: this.buildValoresXML(data.infDPS.valores),
          dhEmi: data.infDPS.dhEmi,
          cNatOp: data.infDPS.cNatOp,
          cRegTrib: data.infDPS.cRegTrib,
          xRegTrib: data.infDPS.xRegTrib,
          optSimpNac: data.infDPS.optSimpNac,
          dCompet: data.infDPS.dCompet
        }
      }
    };

    return this.xmlProcessor.buildXML(dpsObj);
  }

  private buildPrestadorXML(prestador: PrestadorData): XMLElement {
    return {
      cPrest: prestador.cPrest,
      CNPJ: prestador.cnpj,
      xNome: prestador.xNome,
      endereco: this.buildEnderecoXML(prestador.endereco),
      ...(prestador.contato && { contato: this.buildContatoXML(prestador.contato) })
    };
  }

  private buildTomadorXML(tomador: TomadorData): XMLElement {
    return {
      [tomador.cnpjCpf.length === 11 ? 'CPF' : 'CNPJ']: tomador.cnpjCpf,
      xNome: tomador.xNome,
      endereco: this.buildEnderecoXML(tomador.endereco),
      ...(tomador.contato && { contato: this.buildContatoXML(tomador.contato) })
    };
  }

  private buildEnderecoXML(endereco: EnderecoData): XMLElement {
    return {
      xLog: endereco.xLog,
      nro: endereco.nro,
      ...(endereco.xCpl && { xCpl: endereco.xCpl }),
      xBairro: endereco.xBairro,
      cMun: endereco.cMun,
      xMun: endereco.xMun,
      UF: endereco.uf,
      CEP: endereco.cep
    };
  }

  private buildContatoXML(contato: ContatoData): XMLElement {
    return {
      ...(contato.tel && { tel: contato.tel }),
      ...(contato.email && { email: contato.email })
    };
  }

  private buildServicoXML(servico: ServicoData): XMLElement {
    return {
      cServ: servico.cServ,
      xServ: servico.xServ,
      cLCServ: servico.cLCServ,
      xLCServ: servico.xLCServ
    };
  }

  private buildValoresXML(valores: ValoresData): XMLElement {
    return {
      vServ: valores.vServ.toFixed(2),
      ...(valores.vDed && { vDed: valores.vDed.toFixed(2) }),
      vBC: valores.vBC.toFixed(2),
      pISS: valores.pISS.toFixed(4),
      vISS: valores.vISS.toFixed(2),
      vLiq: valores.vLiq.toFixed(2)
    };
  }

  parseNFSeXML(xmlString: string): NFSeData {
    const parsed = this.xmlProcessor.parseXML(xmlString);
    
    if (!parsed.NFSe) {
      throw new Error('XML não contém elemento NFSe válido');
    }

    return this.extractNFSeData(parsed.NFSe);
  }

  parseDPSXML(xmlString: string): DPSData {
    const parsed = this.xmlProcessor.parseXML(xmlString);
    
    if (!parsed.DPS) {
      throw new Error('XML não contém elemento DPS válido');
    }

    return this.extractDPSData(parsed.DPS);
  }

  private extractNFSeData(nfseElement: XMLElement): NFSeData {
    return {
      versao: String(nfseElement['@_versao'] || '1.00'),
      infNFSe: {
        xLocEmi: String((nfseElement.infNFSe as XMLElement)?.xLocEmi || ''),
        xLocPrestacao: String((nfseElement.infNFSe as XMLElement)?.xLocPrestacao || ''),
        nNFSe: (nfseElement.infNFSe as XMLElement)?.nNFSe ? String((nfseElement.infNFSe as XMLElement).nNFSe) : undefined,
        cLocIncid: (nfseElement.infNFSe as XMLElement)?.cLocIncid ? String((nfseElement.infNFSe as XMLElement).cLocIncid) : undefined,
        dhEmi: String((nfseElement.infNFSe as XMLElement)?.dhEmi || ''),
        cNatOp: String((nfseElement.infNFSe as XMLElement)?.cNatOp || ''),
        cRegTrib: String((nfseElement.infNFSe as XMLElement)?.cRegTrib || ''),
        xRegTrib: String((nfseElement.infNFSe as XMLElement)?.xRegTrib || ''),
        optSimpNac: String((nfseElement.infNFSe as XMLElement)?.optSimpNac || ''),
        dCompet: String((nfseElement.infNFSe as XMLElement)?.dCompet || ''),
        prestador: this.extractPrestadorData((nfseElement.infNFSe as XMLElement)?.prest as XMLElement),
        tomador: this.extractTomadorData((nfseElement.infNFSe as XMLElement)?.tomador as XMLElement),
        servico: this.extractServicoData((nfseElement.infNFSe as XMLElement)?.serv as XMLElement),
        valores: this.extractValoresData((nfseElement.infNFSe as XMLElement)?.valores as XMLElement)
      }
    };
  }

  private extractDPSData(dpsElement: XMLElement): DPSData {
    return {
      versao: String(dpsElement['@_versao'] || '1.00'),
      infDPS: {
        prestador: this.extractPrestadorData((dpsElement.infDPS as XMLElement)?.prest as XMLElement),
        tomador: this.extractTomadorData((dpsElement.infDPS as XMLElement)?.tomador as XMLElement),
        servico: this.extractServicoData((dpsElement.infDPS as XMLElement)?.serv as XMLElement),
        valores: this.extractValoresData((dpsElement.infDPS as XMLElement)?.valores as XMLElement),
        dhEmi: String((dpsElement.infDPS as XMLElement)?.dhEmi || ''),
        cNatOp: String((dpsElement.infDPS as XMLElement)?.cNatOp || ''),
        cRegTrib: String((dpsElement.infDPS as XMLElement)?.cRegTrib || ''),
        xRegTrib: String((dpsElement.infDPS as XMLElement)?.xRegTrib || ''),
        optSimpNac: String((dpsElement.infDPS as XMLElement)?.optSimpNac || ''),
        dCompet: String((dpsElement.infDPS as XMLElement)?.dCompet || '')
      }
    };
  }

  private extractPrestadorData(prestElement: XMLElement): PrestadorData {
    return {
      cPrest: String(prestElement.cPrest || ''),
      cnpj: String(prestElement.CNPJ || ''),
      xNome: String(prestElement.xNome || ''),
      endereco: this.extractEnderecoData(prestElement.endereco as XMLElement),
      contato: prestElement.contato ? this.extractContatoData(prestElement.contato as XMLElement) : undefined
    };
  }

  private extractTomadorData(tomadorElement: XMLElement): TomadorData {
    return {
      cnpjCpf: String(tomadorElement.CNPJ || tomadorElement.CPF || ''),
      xNome: String(tomadorElement.xNome || ''),
      endereco: this.extractEnderecoData(tomadorElement.endereco as XMLElement),
      contato: tomadorElement.contato ? this.extractContatoData(tomadorElement.contato as XMLElement) : undefined
    };
  }

  private extractEnderecoData(enderecoElement: XMLElement): EnderecoData {
    return {
      xLog: String(enderecoElement.xLog || ''),
      nro: String(enderecoElement.nro || ''),
      xCpl: enderecoElement.xCpl ? String(enderecoElement.xCpl) : undefined,
      xBairro: String(enderecoElement.xBairro || ''),
      cMun: String(enderecoElement.cMun || ''),
      xMun: String(enderecoElement.xMun || ''),
      uf: String(enderecoElement.UF || ''),
      cep: String(enderecoElement.CEP || '')
    };
  }

  private extractContatoData(contatoElement: XMLElement): ContatoData {
    return {
      tel: contatoElement.tel ? String(contatoElement.tel) : undefined,
      email: contatoElement.email ? String(contatoElement.email) : undefined
    };
  }

  private extractServicoData(servicoElement: XMLElement): ServicoData {
    return {
      cServ: String(servicoElement.cServ || ''),
      xServ: String(servicoElement.xServ || ''),
      cLCServ: String(servicoElement.cLCServ || ''),
      xLCServ: String(servicoElement.xLCServ || '')
    };
  }

  private extractValoresData(valoresElement: XMLElement): ValoresData {
    return {
      vServ: parseFloat(String(valoresElement.vServ || '0')),
      vDed: valoresElement.vDed ? parseFloat(String(valoresElement.vDed)) : undefined,
      vBC: parseFloat(String(valoresElement.vBC || '0')),
      pISS: parseFloat(String(valoresElement.pISS || '0')),
      vISS: parseFloat(String(valoresElement.vISS || '0')),
      vLiq: parseFloat(String(valoresElement.vLiq || '0'))
    };
  }
}