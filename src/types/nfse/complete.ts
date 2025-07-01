// Tipos completos conforme análise dos schemas XSD

export interface CompleteDPSData {
  versao: string;
  infDPS: {
    Id: string;
    tpAmb: '1' | '2'; // 1-Produção, 2-Homologação
    dhEmi: string; // ISO DateTime
    verAplic: string;
    serie?: string;
    nDPS: string;
    dCompet: string; // YYYY-MM-DD
    tpEmit: '1' | '2' | '3'; // 1-Prestador, 2-Tomador, 3-Intermediário
    cLocEmi: string; // Código IBGE do município
    subst?: SubstituicaoData;
    prest: PrestadorCompleto;
    toma: TomadorCompleto;
    interm?: IntermediarioCompleto;
    serv: ServicoCompleto;
    valores: ValoresCompletos;
  };
}

export interface SubstituicaoData {
  chSubstda: string;
  cMotivo: string;
  xMotivo: string;
}

export interface PrestadorCompleto {
  // Identificação (choice)
  CNPJ?: string;
  CPF?: string;
  NIF?: string;
  CAEPF?: string;
  
  IM?: string; // Inscrição Municipal
  xNome: string;
  xFant?: string; // Nome fantasia
  
  end: EnderecoCompleto;
  fone?: string;
  email?: string;
  
  regTrib: RegimeTributario;
}

export interface TomadorCompleto {
  // Identificação (choice)
  CNPJ?: string;
  CPF?: string;
  NIF?: string;
  cNaoNIF?: string;
  CAEPF?: string;
  
  IM?: string;
  xNome: string;
  end: EnderecoCompleto;
  fone?: string;
  email?: string;
}

export interface IntermediarioCompleto {
  // Mesma estrutura do tomador
  CNPJ?: string;
  CPF?: string;
  NIF?: string;
  cNaoNIF?: string;
  CAEPF?: string;
  
  IM?: string;
  xNome: string;
  end: EnderecoCompleto;
  fone?: string;
  email?: string;
}

export interface EnderecoCompleto {
  // Nacional ou Exterior (choice)
  endNac?: EnderecoNacional;
  endExt?: EnderecoExterior;
  
  xLgr: string;
  nro: string;
  xCpl?: string;
  xBairro: string;
}

export interface EnderecoNacional {
  cMun: string; // Código IBGE
  CEP: string;
}

export interface EnderecoExterior {
  cPais: string;
  xCidade: string;
  xEstado?: string;
  CEP?: string;
}

export interface RegimeTributario {
  opSimpNac: '1' | '2' | '3'; // 1-Não Optante, 2-MEI, 3-ME/EPP
  regApTribSN?: '1' | '2' | '3'; // Regime apuração Simples Nacional
  regEspTrib: string; // 0-Nenhum, 1-Ato Cooperado, etc.
}

export interface ServicoCompleto {
  locPrest: LocalPrestacao;
  cServ: CodigoServico;
  comExt?: ComercioExterior;
  lsadppu?: LocacaoSublocacao;
  obra?: DadosObra;
  atvEvento?: AtividadeEvento;
  explRod?: ExploracaoRodoviaria;
  infoCompl?: InformacoesComplementares;
}

export interface LocalPrestacao {
  cLocPrestacao: string;
  cPaisPrestacao?: string;
  opConsumServ?: string;
}

export interface CodigoServico {
  cTribNac: string;
  cTribMun?: string;
  xDescServ: string;
  cNBS?: string;
  cIntContrib?: string;
}

export interface ComercioExterior {
  mdPrestacao: string;
  vincPrest: string;
  tpMoeda: string;
  vServMoeda: number;
  mecAFComexP: string;
  mecAFComexT: string;
  movTempBens: string;
  mdic: string;
  nroDI?: string;
  nroRE?: string;
}

export interface LocacaoSublocacao {
  categ: string;
  objeto: string;
  extensao?: number;
  nPostes?: number;
}

export interface DadosObra {
  cCno?: string;
  cCei?: string;
  inscImobFisc?: string;
  endObra?: EnderecoCompleto;
}

export interface AtividadeEvento {
  xDescEvento: string;
  dtIni: string;
  dtFim: string;
  idEvento?: string;
  endEvento?: EnderecoCompleto;
}

export interface ExploracaoRodoviaria {
  categVeic: string;
  nroEixos: number;
  tpRodagem: string;
  sentido: string;
  placa?: string;
  codAcesso?: string;
  codContrato?: string;
}

export interface InformacoesComplementares {
  idDocTec?: string;
  docRef?: string;
  xInfComp?: string;
}

export interface ValoresCompletos {
  vServPrest: ValorServicoPrestado;
  vDescCondIncond?: ValorDescontos;
  vDedRed?: ValorDeducoes;
  trib: Tributacao;
}

export interface ValorServicoPrestado {
  vReceb?: number; // Valor recebido pelo intermediário
  vServ: number;
}

export interface ValorDescontos {
  vDescIncond?: number;
  vDescCond?: number;
}

export interface ValorDeducoes {
  pDR?: number; // Percentual
  vDR?: number; // Valor
  documentos?: DocumentoDeducao[];
}

export interface DocumentoDeducao {
  // Lista de documentos para dedução
  tpDoc: string;
  nDoc: string;
  vDeducao: number;
}

export interface Tributacao {
  tribMun: TributacaoMunicipal;
  tribFed?: TributacaoFederal;
  totTrib?: TotalTributos;
}

export interface TributacaoMunicipal {
  tribISSQN: '1' | '2' | '3' | '4'; // 1-Tributável, 2-Exportação, 3-Não Incidência, 4-Imunidade
  cPaisResult?: string; // Para exportação
  BM?: BeneficioMunicipal;
  exigSusp?: ExigibilidadeSuspensa;
  tpImunidade?: string;
  pAliq?: number;
  tpRetISSQN?: '1' | '2'; // 1-Sim, 2-Não
}

export interface BeneficioMunicipal {
  tpBM: string;
  nBM: string;
  vRedBCBM?: number;
}

export interface ExigibilidadeSuspensa {
  tpSusp: string;
  nProcesso: string;
}

export interface TributacaoFederal {
  piscofins?: PisCofins;
  vRetCP?: number;
  vRetIRRF?: number;
  vRetCSLL?: number;
}

export interface PisCofins {
  CST: string;
  vBCPisCofins?: number;
  pAliqPis?: number;
  pAliqCofins?: number;
  vPis?: number;
  vCofins?: number;
  tpRetPisCofins?: '1' | '2';
}

export interface TotalTributos {
  vTotTrib?: ValorTotalTributos;
  pTotTribPerc?: PercentualTotalTributos;
  indTotTrib?: string;
  tribSN?: TributacaoSimplesNacional;
}

export interface ValorTotalTributos {
  vTotTribFed: number;
  vTotTribEst: number;
  vTotTribMun: number;
}

export interface PercentualTotalTributos {
  pTotTribFed: number;
  pTotTribEst: number;
  pTotTribMun: number;
}

export interface TributacaoSimplesNacional {
  optSimpNac: '1' | '2';
  pAliqSN?: number;
  vAliqProdSN?: number;
}

// NFSe completa com DPS
export interface CompleteNFSeData {
  versao: string;
  infNFSe: {
    Id: string;
    xLocEmi: string;
    xLocPrestacao: string;
    nNFSe?: string;
    cLocIncid?: string;
    xLocIncid?: string;
    xTribNac?: string;
    xTribMun?: string;
    verAplic: string;
    ambGer: '1' | '2';
    tpEmis: '1' | '2';
    procEmi: '1' | '2' | '3';
    cStat: string;
    dhProc: string;
    nDFSe?: string;
    emit: EmitenteDados;
    valores: ValoresNFSe;
    DPS: CompleteDPSData;
  };
}

export interface EmitenteDados {
  CNPJ: string;
  IM: string;
  xNome: string;
  xFant?: string;
  enderNac: EnderecoNacional & {
    xLgr: string;
    nro: string;
    xCpl?: string;
    xBairro: string;
    UF: string;
  };
  fone?: string;
  email?: string;
}

export interface ValoresNFSe {
  vCalcDR?: number;
  vCalcBM?: number;
  vBC: number;
  pAliqAplic: number;
  vISSQN: number;
  vTotalRet?: number;
  vLiq: number;
}