import httpClient from '@/lib/http-client';
import {
  XmlSigningRequest,
  XmlSigningResponse,
  Nfse,
  PaginatedResponse,
  NfseListResponse,
  PeriodoRequest,
  TesteRequest,
  TesteResponse,
  NfseDto,
  NfseDtoPaginatedResult,
  CancelarNfseRequest,
  ObjectApiResponse,
  Lotedfe
} from '@/types/nfse-api';

class NFSeApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  async signAndSendXml(xmlContent: string): Promise<XmlSigningResponse> {
    const request: XmlSigningRequest = { xmlContent };
    return await httpClient.post(`${this.baseURL}/api/NFSe/sign-and-send`, request);
  }

  async getNfseById(id: string): Promise<Nfse> {
    return await httpClient.get(`${this.baseURL}/api/nfse-data/${id}`);
  }

  async getNfseByChaveAcesso(chaveAcesso: string): Promise<Nfse> {
    return await httpClient.get(`${this.baseURL}/api/nfse-data/chave/${chaveAcesso}`);
  }

  async getAllNfse(): Promise<NfseListResponse> {
    return await httpClient.get(`${this.baseURL}/api/nfse-data`);
  }

  async getPaginatedNfse(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Nfse>> {
    try {
      const response = await httpClient.get(`${this.baseURL}/api/nfse-data/paginated`, {
        params: { page, pageSize }
      });
      
      return {
        data: response.items || response.data || [],
        totalCount: response.totalCount || 0,
        pageNumber: response.page || page,
        pageSize: response.pageSize || pageSize,
        totalPages: response.totalPages || 0,
        hasNextPage: response.hasNextPage || false,
        hasPreviousPage: response.hasPreviousPage || false,
      };
    } catch (error) {
      console.error('Erro ao buscar NFSe paginadas:', error);
      return {
        data: [],
        totalCount: 0,
        pageNumber: page,
        pageSize: pageSize,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  async getNfseByCadastroNacional(cadastroNacional: string): Promise<Nfse[]> {
    try {
      const response = await httpClient.get(`${this.baseURL}/api/nfse-data/cadastro/${cadastroNacional}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Erro ao buscar NFSe por cadastro nacional:', error);
      return [];
    }
  }

  async getNfseByPeriodo(periodo: PeriodoRequest): Promise<Nfse[]> {
    try {
      const response = await httpClient.post(`${this.baseURL}/api/nfse-data/periodo`, periodo);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Erro ao buscar NFSe por período:', error);
      return [];
    }
  }

  async createTeste(teste: TesteRequest): Promise<TesteResponse> {
    return await httpClient.post(`${this.baseURL}/api/Teste`, teste);
  }

  async getTesteById(id: string): Promise<TesteResponse> {
    return await httpClient.get(`${this.baseURL}/api/Teste/${id}`);
  }

  async getAllTestes(): Promise<TesteResponse[]> {
    try {
      const response = await httpClient.get(`${this.baseURL}/api/Teste`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Erro ao buscar todos os testes:', error);
      return [];
    }
  }

  async getPaginatedTestes(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<TesteResponse>> {
    try {
      const response = await httpClient.get(`${this.baseURL}/api/Teste/paginated`, {
        params: { page, pageSize }
      });
      
      return {
        data: response.items || response.data || [],
        totalCount: response.totalCount || 0,
        pageNumber: response.page || page,
        pageSize: response.pageSize || pageSize,
        totalPages: response.totalPages || 0,
        hasNextPage: response.hasNextPage || false,
        hasPreviousPage: response.hasPreviousPage || false,
      };
    } catch (error) {
      console.error('Erro ao buscar testes paginados:', error);
      return {
        data: [],
        totalCount: 0,
        pageNumber: page,
        pageSize: pageSize,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  async updateTeste(id: string, teste: TesteRequest): Promise<TesteResponse> {
    return await httpClient.put(`${this.baseURL}/api/Teste/${id}`, teste);
  }

  async deleteTeste(id: string): Promise<void> {
    await httpClient.delete(`${this.baseURL}/api/Teste/${id}`);
  }

  // Métodos do NfseIntegration
  async consultarLoteDfe(nsu: string): Promise<Lotedfe[]> {
    try {
      const response = await httpClient.get(`${this.baseURL}/api/NfseIntegration/consultar-lote-dfe/${nsu}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Erro ao consultar lote DFe:', error);
      return [];
    }
  }

  async downloadDanfe(chaveAcesso: string): Promise<Blob> {
    return await httpClient.get(`${this.baseURL}/api/NfseIntegration/download-danfe/${chaveAcesso}`, {
      responseType: 'blob'
    });
  }

  async visualizarDanfe(chaveAcesso: string): Promise<string> {
    try {
      const blob = await this.downloadDanfe(chaveAcesso);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Erro ao visualizar DANFE:', error);
      throw error;
    }
  }

  async cancelarNfse(request: CancelarNfseRequest): Promise<ObjectApiResponse> {
    return await httpClient.post(`${this.baseURL}/api/NfseIntegration/cancelar-nfse`, request);
  }

  // Método para obter NFSes usando o endpoint existente mas com tipagem do NfseDto
  async getPaginatedNfseData(page: number = 1, pageSize: number = 10): Promise<NfseDtoPaginatedResult> {
    try {
      const response = await httpClient.get(`${this.baseURL}/api/nfse-data/paginated`, {
        params: { page, pageSize }
      });
      
      return {
        items: response.items || [],
        page: response.page || page,
        pageSize: response.pageSize || pageSize,
        totalCount: response.totalCount || 0,
        totalPages: response.totalPages || 0,
        hasNextPage: response.hasNextPage || false,
        hasPreviousPage: response.hasPreviousPage || false,
      };
    } catch (error) {
      console.error('Erro ao buscar NFSe data paginadas:', error);
      return {
        items: [],
        page: page,
        pageSize: pageSize,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await httpClient.get(`${this.baseURL}/health`);
      if (response.status === 200) {
        return { status: 'healthy', timestamp: new Date().toISOString() };
      }
      return { status: 'unhealthy', timestamp: new Date().toISOString() };

    } catch (error: any) {
      return { status: 'unhealthy ' + error, timestamp: new Date().toISOString() };
    }
  }
}

export const nfseApiService = new NFSeApiService();
export default nfseApiService;