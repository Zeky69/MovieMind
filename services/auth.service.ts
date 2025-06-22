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
  private static refreshTimer: NodeJS.Timeout | null = null
  private static readonly REFRESH_BUFFER_MINUTES = 5 // Refresh 5 minutes avant expiration

  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(userData: UserCreate): Promise<Token> {
    const response = await api.post<Token>('/auth/register', userData)
    
    // Sauvegarder le token et l'utilisateur
    this.saveAuthData(response)
    
    // Démarrer le timer de refresh automatique
    this.startTokenRefreshTimer(response.expires_in)
    
    return response
  }

  /**
   * Connexion d'un utilisateur
   */
  static async login(credentials: UserLogin): Promise<Token> {
    const response = await api.post<Token>('/auth/login', credentials)
    
    // Sauvegarder le token et l'utilisateur
    this.saveAuthData(response)
    
    // Démarrer le timer de refresh automatique
    this.startTokenRefreshTimer(response.expires_in)
    
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
      // Arrêter le timer de refresh
      this.stopTokenRefreshTimer()
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
    try {
      const response = await api.post<Token>('/auth/refresh', {}, { requiresAuth: true })
      
      // Sauvegarder les nouvelles données
      this.saveAuthData(response)
      
      // Redémarrer le timer avec le nouveau token
      this.startTokenRefreshTimer(response.expires_in)
      
      // Émettre un événement pour notifier du refresh
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('tokenRefreshed', {
          detail: {
            user: response.user,
            token: response.access_token
          }
        })
        window.dispatchEvent(event)
      }
      
      return response
    } catch (error) {
      console.error('Token refresh failed:', error)
      // En cas d'échec, déconnecter l'utilisateur
      this.handleTokenExpiration()
      throw error
    }
  }

  /**
   * Démarrer le timer de refresh automatique du token
   */
  private static startTokenRefreshTimer(expiresIn: number): void {
    // Arrêter le timer existant s'il y en a un
    this.stopTokenRefreshTimer()
    
    // Calculer le délai de refresh (expires_in en secondes - buffer en minutes)
    const refreshDelayMs = (expiresIn - (this.REFRESH_BUFFER_MINUTES * 60)) * 1000
    
    // S'assurer que le délai est positif
    if (refreshDelayMs > 0) {
      console.log(`Token will be refreshed in ${refreshDelayMs / 1000} seconds`)
      
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshToken()
          console.log('Token refreshed automatically')
        } catch (error) {
          console.error('Automatic token refresh failed:', error)
        }
      }, refreshDelayMs)
    } else {
      // Si le token expire bientôt, essayer de le rafraîchir immédiatement
      console.warn('Token expires soon, refreshing immediately')
      this.refreshToken().catch(console.error)
    }
  }

  /**
   * Arrêter le timer de refresh automatique
   */
  private static stopTokenRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * Initialiser le refresh automatique au démarrage de l'application
   */
  static initializeAutoRefresh(): void {
    if (typeof window === 'undefined') return
    
    const tokenData = this.getStoredTokenData()
    if (tokenData && tokenData.expires_in) {
      // Calculer le temps écoulé depuis la sauvegarde
      const now = Math.floor(Date.now() / 1000)
      const elapsed = now - tokenData.stored_at
      const remainingTime = tokenData.expires_in - elapsed
      
      if (remainingTime > 0) {
        this.startTokenRefreshTimer(remainingTime)
      } else {
        // Token expiré, essayer de le rafraîchir
        this.refreshToken().catch(() => {
          this.handleTokenExpiration()
        })
      }
    }
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
    
    // Sauvegarder le token et l'utilisateur
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, tokenData.access_token)
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(tokenData.user))
    
    // Sauvegarder les métadonnées du token pour le refresh automatique
    const tokenMetadata = {
      expires_in: tokenData.expires_in,
      stored_at: Math.floor(Date.now() / 1000), // timestamp Unix
      token_type: tokenData.token_type
    }
    localStorage.setItem(AUTH_CONFIG.TOKEN_METADATA_KEY, JSON.stringify(tokenMetadata))
  }

  /**
   * Récupérer les métadonnées du token stockées
   */
  private static getStoredTokenData(): { expires_in: number; stored_at: number; token_type: string } | null {
    if (typeof window === 'undefined') return null
    
    try {
      const metadataStr = localStorage.getItem(AUTH_CONFIG.TOKEN_METADATA_KEY)
      if (!metadataStr) return null
      
      return JSON.parse(metadataStr)
    } catch (error) {
      console.error('Error parsing token metadata:', error)
      return null
    }
  }

  /**
   * Nettoyer les données d'authentification
   */
  private static clearAuthData(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
    localStorage.removeItem(AUTH_CONFIG.USER_KEY)
    localStorage.removeItem(AUTH_CONFIG.TOKEN_METADATA_KEY)
  }

  /**
   * Vérifier si le token doit être renouvelé
   */
  static shouldRefreshToken(): boolean {
    const tokenData = this.getStoredTokenData()
    if (!tokenData) return false
    
    const now = Math.floor(Date.now() / 1000)
    const elapsed = now - tokenData.stored_at
    const remainingTime = tokenData.expires_in - elapsed
    
    // Rafraîchir si il reste moins de 5 minutes
    return remainingTime <= (this.REFRESH_BUFFER_MINUTES * 60)
  }

  /**
   * Vérifier si le token est expiré
   */
  static isTokenExpired(): boolean {
    const tokenData = this.getStoredTokenData()
    if (!tokenData) return true
    
    const now = Math.floor(Date.now() / 1000)
    const elapsed = now - tokenData.stored_at
    
    return elapsed >= tokenData.expires_in
  }

  /**
   * Gérer l'expiration du token
   */
  static handleTokenExpiration(): void {
    this.stopTokenRefreshTimer()
    this.clearAuthData()
    
    // Émettre un événement pour notifier de l'expiration
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('tokenExpired')
      window.dispatchEvent(event)
      
      // Rediriger vers la page de connexion après un petit délai
      setTimeout(() => {
        console.log('Token expired, redirecting to login')
        window.location.href = '/login'
      }, 100)
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
  getCurrentUserFromStorage,
  shouldRefreshToken,
  isTokenExpired,
  initializeAutoRefresh,
  handleTokenExpiration
} = AuthService
