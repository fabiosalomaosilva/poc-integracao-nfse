export interface XmlSigningRequest {
  xmlContent: string;
}

export interface XmlSigningResponse {
  lote: LoteProcessamento[];
  tipoAmbiente: string;
  versaoAplicativo: string;
  dataHoraProcessamento: string;
}

export interface LoteProcessamento {
  chaveAcesso: string;
  nsu: string | null;
  statusProcessamento: string;
  alertas: string | null;
  erros: string | null;
}

export interface Nfse {
  vLiq: string | number | undefined;
  vissqn: string | number | undefined;
  pAliqAplic: string | number | undefined;
  vbc: string | number | undefined;
  vServ: string | number | undefined;
  nomeEmitente: string;
  cTribNac: string;
  id: string;
  chaveAcesso: string;
  cadastroNacional: string;
  dataProcessamento: string;
  statusProcessamento: string;
  xmlContent: string;
  alertas?: string;
  erros?: string;
  nsu?: string;
  tipoAmbiente: string;
  versaoAplicativo: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NfseListResponse {
  nfses: Nfse[];
  totalCount: number;
}

export interface PeriodoRequest {
  dataInicio: string;
  dataFim: string;
  cadastroNacional?: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: any;
}

export interface TesteRequest {
  nome: string;
  dataTeste: string;
  chaveAcesso: string;
  xml: string;
}

export interface TesteResponse {
  id: number; // API returns number, not string
  nome: string;
  dataTeste: string;
  chaveAcesso: string;
  xml: string;
  createdAt: string;
  updatedAt?: string;
}

// Interfaces para NfseIntegration baseadas no swagger
export interface NfseDto {
  id: number;
  createdAt: string;
  chaveAcesso: string;
  cadastroNacional: string;
  nomeEmitente: string;
  dataProcessamento: string;
  cTribNac: string;
  vServ: number;
  vbc: number;
  pAliqAplic: number;
  vissqn: number;
  vLiq: number;
}

export interface NfseDtoPaginatedResult {
  items: NfseDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CancelarNfseRequest {
  chaveAcesso: string;
  xmlCancelamento: string;
}

export interface MensagemProcessamento {
  Descricao: string;
  Codigo: string;
  Parametros?: string[];
  Complemento?: string;
}

export interface ObjectApiResponse {
  success: boolean;
  data?: any;
  errorMessage?: MensagemProcessamento;
  timestamp: string;
}

export interface Lotedfe {
  nsu: number;
  chaveAcesso: string;
  tipoDocumento: string;
  tipoEvento: string;
  arquivoXml: string;
  dataHoraRecebimento: string;
  dataHoraGeracao: string;
}