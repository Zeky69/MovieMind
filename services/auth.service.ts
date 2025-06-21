import { api } from '@/lib/api'
import { AUTH_CONFIG } from '@/lib/config'
import type { 
  User, 
  UserCreate, 
  UserLogin, 
  Token, 
  AuthState 
} from '@/types/user'

/**
 * Service d'authentification
 */
export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(userData: UserCreate): Promise<Token> {
    const response = await api.post<Token>('/auth/register', userData)
    
    // Sauvegarder le token et l'utilisateur
    this.saveAuthData(response)
    
    return response
  }

  /**
   * Connexion d'un utilisateur
   */
  static async login(credentials: UserLogin): Promise<Token> {
    const response = await api.post<Token>('/auth/login', credentials)
    
    // Sauvegarder le token et l'utilisateur
    this.saveAuthData(response)
    
    return response
  }

  /**
   * Déconnexion
   */
  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {}, { requiresAuth: true })
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      // Nettoyer les données locales même si l'API échoue
      this.clearAuthData()
    }
  }

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  static async getCurrentUser(): Promise<User> {
    return await api.get<User>('/auth/me', { requiresAuth: true })
  }

  /**
   * Renouveler le token d'accès
   */
  static async refreshToken(): Promise<Token> {
    const response = await api.post<Token>('/auth/refresh', {}, { requiresAuth: true })
    
    // Sauvegarder les nouvelles données
    this.saveAuthData(response)
    
    return response
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
    const user = localStorage.getItem(AUTH_CONFIG.USER_KEY)
    
    return !!(token && user)
  }

  /**
   * Récupérer l'état d'authentification complet
   */
  static getAuthState(): AuthState {
    if (typeof window === 'undefined') {
      return {
        isAuthenticated: false,
        user: null,
        token: null
      }
    }

    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
    const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY)
    
    let user: User | null = null
    if (userStr) {
      try {
        user = JSON.parse(userStr)
      } catch (error) {
        console.error('Error parsing user data:', error)
        this.clearAuthData()
      }
    }

    return {
      isAuthenticated: !!(token && user),
      user,
      token
    }
  }

  /**
   * Récupérer le token actuel
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
  }

  /**
   * Récupérer l'utilisateur actuel depuis le storage
   */
  static getCurrentUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null
    
    const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY)
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }

  /**
   * Sauvegarder les données d'authentification
   */
  private static saveAuthData(tokenData: Token): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, tokenData.access_token)
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(tokenData.user))
  }

  /**
   * Nettoyer les données d'authentification
   */
  private static clearAuthData(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
    localStorage.removeItem(AUTH_CONFIG.USER_KEY)
  }

  /**
   * Vérifier si le token doit être renouvelé
   */
  static shouldRefreshToken(): boolean {
    // Ici, vous pourriez implémenter une logique pour vérifier
    // l'expiration du token basée sur expires_in
    // Pour l'instant, on retourne false
    return false
  }

  /**
   * Gérer l'expiration du token
   */
  static handleTokenExpiration(): void {
    this.clearAuthData()
    // Rediriger vers la page de connexion
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}

// Export des méthodes principales pour une utilisation directe
export const {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  isAuthenticated,
  getAuthState,
  getToken,
  getCurrentUserFromStorage
} = AuthService
