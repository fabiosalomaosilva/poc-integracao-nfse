import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

class HttpClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY
        
        if (apiKey && this.isExternalApiCall(config.url)) {
          config.headers['X-API-Key'] = apiKey
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error('API authentication failed. Check your API key.')
        }
        return Promise.reject(error)
      }
    )
  }

  private isExternalApiCall(url?: string): boolean {
    if (!url) return false
    
    const externalApiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!externalApiUrl) return false
    
    return url.startsWith(externalApiUrl) || url.includes('/api/NFSe/')
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }
}

export const httpClient = new HttpClient()
export default httpClient