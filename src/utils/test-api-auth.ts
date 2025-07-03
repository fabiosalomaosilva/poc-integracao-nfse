import httpClient from '@/lib/http-client'

export async function testApiAuthentication(): Promise<{ success: boolean; message: string }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const apiKey = process.env.NEXT_PUBLIC_API_KEY

    if (!apiUrl) {
      return {
        success: false,
        message: 'API URL não configurada. Verifique a variável NEXT_PUBLIC_API_URL no arquivo .env'
      }
    }

    if (!apiKey || apiKey === 'your_api_key_here') {
      return {
        success: false,
        message: 'API Key não configurada. Verifique a variável NEXT_PUBLIC_API_KEY no arquivo .env'
      }
    }

    const testPayload = {
      xmlContent: '<?xml version="1.0" encoding="UTF-8"?><test>API Auth Test</test>'
    }

    const response = await httpClient.post(`${apiUrl}/api/NFSe/sign-and-send`, testPayload)

    return {
      success: true,
      message: `Teste de autenticação bem-sucedido! API respondeu com dados: ${JSON.stringify(response).substring(0, 100)}...`
    }
  } catch (error: any) {
    let errorMessage = 'Erro desconhecido durante o teste'

    if (error.response?.status === 401) {
      errorMessage = 'Erro 401: API Key inválida ou não autorizada'
    } else if (error.response?.status === 403) {
      errorMessage = 'Erro 403: API Key não tem permissão para acessar este recurso'
    } else if (error.response?.status === 404) {
      errorMessage = 'Erro 404: Endpoint da API não encontrado'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Erro de conexão: API não está rodando ou inacessível'
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`
    }

    return {
      success: false,
      message: errorMessage
    }
  }
}

export function validateApiConfiguration(): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = []

  if (!process.env.NEXT_PUBLIC_API_URL) {
    missingFields.push('NEXT_PUBLIC_API_URL')
  }

  if (!process.env.NEXT_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_API_KEY === 'your_api_key_here') {
    missingFields.push('NEXT_PUBLIC_API_KEY')
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}