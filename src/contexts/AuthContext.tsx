'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import authService, { AuthUser } from '@/services/auth-service';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// Routes that don't require authentication
//const publicRoutes = ['/login'];

// Routes that require authentication
const protectedRoutes = ['/', '/nfse', '/testes'];

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const session = await authService.getSession();
        if (session?.user) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      if (isLoading) {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Handle route protection
    if (!isLoading) {
      //const isPublicRoute = publicRoutes.includes(pathname);
      const isProtectedRoute = protectedRoutes.includes(pathname);

      if (!user && isProtectedRoute) {
        // User is not authenticated and trying to access protected route
        router.push('/login');
      } else if (user && pathname === '/login') {
        // User is authenticated and on login page, redirect to home
        router.push('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login({ email, password });

      if (result.user && !result.error) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Falha na autenticação' };
      }
    } catch (error) {
      return { success: false, error: `Erro inesperado durante o login. Erro: ${error}` };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      setUser(null);
      router.push('/login');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protecting components
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}

export default AuthContext;