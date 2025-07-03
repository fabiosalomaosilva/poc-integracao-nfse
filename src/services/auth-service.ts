import { supabaseAuth } from '@/lib/supabase-auth'
import { User, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: AuthUser | null
  error: string | null
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return {
          user: null,
          error: this.getErrorMessage(error)
        }
      }

      if (!data.user) {
        return {
          user: null,
          error: 'Falha na autenticação'
        }
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email
        },
        error: null
      }
    } catch (error) {
      return {
        user: null,
        error: 'Erro inesperado durante o login'
      }
    }
  }

  async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabaseAuth.auth.signOut()
      
      if (error) {
        return { error: this.getErrorMessage(error) }
      }

      return { error: null }
    } catch (error) {
      return { error: 'Erro inesperado durante o logout' }
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabaseAuth.auth.getUser()
      
      if (!user) {
        return null
      }

      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error)
      return null
    }
  }

  async getSession() {
    try {
      const { data: { session } } = await supabaseAuth.auth.getSession()
      return session
    } catch (error) {
      console.error('Erro ao obter sessão:', error)
      return null
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabaseAuth.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email
        }
        callback(authUser)
      } else {
        callback(null)
      }
    })
  }

  private getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Email ou senha incorretos'
      case 'Email not confirmed':
        return 'Email não confirmado. Verifique sua caixa de entrada.'
      case 'Too many requests':
        return 'Muitas tentativas de login. Tente novamente mais tarde.'
      case 'User not found':
        return 'Usuário não encontrado'
      case 'Invalid email':
        return 'Email inválido'
      case 'Password should be at least 6 characters':
        return 'A senha deve ter pelo menos 6 caracteres'
      default:
        return error.message || 'Erro de autenticação'
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  isValidPassword(password: string): boolean {
    return password.length >= 6
  }
}

export const authService = new AuthService()
export default authService