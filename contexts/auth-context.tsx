'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthService } from '@/services/auth.service'
import type { User, AuthState, UserLogin, UserCreate, Token } from '@/types/user'

interface AuthContextType extends AuthState {
  login: (credentials: UserLogin) => Promise<Token>
  register: (userData: UserCreate) => Promise<Token>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  })
  const [loading, setLoading] = useState(true)

  // Initialiser l'état d'authentification au montage
  useEffect(() => {
    const initAuth = () => {
      try {
        const state = AuthService.getAuthState()
        setAuthState(state)
        
        // Initialiser le refresh automatique si l'utilisateur est authentifié
        if (state.isAuthenticated) {
          AuthService.initializeAutoRefresh()
        }
      } catch (error) {
        console.error('Error initializing auth state:', error)
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null
        })
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Écouter les changements d'état d'authentification pour gérer le refresh
  useEffect(() => {
    // Créer un gestionnaire d'événements pour le refresh automatique
    const handleTokenRefresh = (event: CustomEvent) => {
      const { user, token } = event.detail
      setAuthState(prev => ({
        ...prev,
        user,
        token
      }))
    }

    // Créer un gestionnaire pour l'expiration du token
    const handleTokenExpiration = () => {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null
      })
    }

    // Ajouter les écouteurs d'événements
    window.addEventListener('tokenRefreshed', handleTokenRefresh as EventListener)
    window.addEventListener('tokenExpired', handleTokenExpiration)

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefresh as EventListener)
      window.removeEventListener('tokenExpired', handleTokenExpiration)
    }
  }, [])

  // Fonction de connexion
  const login = useCallback(async (credentials: UserLogin): Promise<Token> => {
    try {
      setLoading(true)
      const tokenData = await AuthService.login(credentials)
      
      setAuthState({
        isAuthenticated: true,
        user: tokenData.user,
        token: tokenData.access_token
      })

      return tokenData
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction d'inscription
  const register = useCallback(async (userData: UserCreate): Promise<Token> => {
    try {
      setLoading(true)
      const tokenData = await AuthService.register(userData)
      
      setAuthState({
        isAuthenticated: true,
        user: tokenData.user,
        token: tokenData.access_token
      })

      return tokenData
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction de déconnexion
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      await AuthService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null
      })
      setLoading(false)
    }
  }, [])

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      if (!authState.isAuthenticated) return
      
      const user = await AuthService.getCurrentUser()
      setAuthState(prev => ({
        ...prev,
        user
      }))
    } catch (error) {
      console.error('Error refreshing user:', error)
      // Si l'erreur est liée à l'authentification, déconnecter
      if (error instanceof Error && error.message.includes('401')) {
        await logout()
      }
    }
  }, [authState.isAuthenticated, logout])

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshUser,
    loading
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook pour protéger les routes
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Rediriger vers la page de connexion
      window.location.href = '/login'
    }
  }, [isAuthenticated, loading])

  return { isAuthenticated, loading }
}
