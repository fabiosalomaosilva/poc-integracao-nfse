export interface NFSeData {
  infNFSe: {
    xLocEmi: string;
    xLocPrestacao: string;
    nNFSe?: string;
    cLocIncid?: string;
    dhEmi: string;
    cNatOp: string;
    cRegTrib: string;
    xRegTrib: string;
    optSimpNac: string;
    dCompet: string;
    prestador: PrestadorData;
    tomador: TomadorData;
    servico: ServicoData;
    valores: ValoresData;
  };
  versao: string;
}

export interface PrestadorData {
  cPrest: string;
  cnpj: string;
  xNome: string;
  endereco: EnderecoData;
  contato?: ContatoData;
}

export interface TomadorData {
  cnpjCpf: string;
  xNome: string;
  endereco: EnderecoData;
  contato?: ContatoData;
}

export interface EnderecoData {
  xLog: string;
  nro: string;
  xCpl?: string;
  xBairro: string;
  cMun: string;
  xMun: string;
  uf: string;
  cep: string;
}

export interface ContatoData {
  tel?: string;
  email?: string;
}

export interface ServicoData {
  cServ: string;
  xServ: string;
  cLCServ: string;
  xLCServ: string;
}

export interface ValoresData {
  vServ: number;
  vDed?: number;
  vBC: number;
  pISS: number;
  vISS: number;
  vLiq: number;
}

export interface DPSData {
  infDPS: {
    prestador: PrestadorData;
    tomador: TomadorData;
    servico: ServicoData;
    valores: ValoresData;
    dhEmi: string;
    cNatOp: string;
    cRegTrib: string;
    xRegTrib: string;
    optSimpNac: string;
    dCompet: string;
  };
  versao: string;
}