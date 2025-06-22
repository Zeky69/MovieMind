import { API_CONFIG } from './config'

/**
 * Types d'erreur API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Options pour les requêtes API
 */
interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean
  timeout?: number
  skipTokenRefresh?: boolean // Pour éviter les boucles infinies lors du refresh
}

/**
 * Gestionnaire de requêtes API centralisé
 */
export class Api {
  private baseURL: string
  private timeout: number
  private isRefreshing: boolean = false
  private refreshPromise: Promise<any> | null = null

  constructor(baseURL: string = API_CONFIG.BASE_URL, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  /**
   * Récupérer le token d'authentification
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('moviemind_token')
  }

  /**
   * Vérifier et rafraîchir le token si nécessaire
   */
  private async ensureValidToken(options: ApiRequestOptions = {}): Promise<void> {
    // Ignorer la vérification si on ne nécessite pas d'auth ou si on est déjà en train de rafraîchir
    if (!options.requiresAuth || options.skipTokenRefresh) {
      return
    }

    // Importer dynamiquement le service d'auth pour éviter les dépendances circulaires
    const { AuthService } = await import('@/services/auth.service')
    
    // Vérifier si le token doit être rafraîchi
    if (AuthService.shouldRefreshToken()) {
      if (this.isRefreshing) {
        // Si on est déjà en train de rafraîchir, attendre la fin
        await this.refreshPromise
      } else {
        // Démarrer le processus de refresh
        this.isRefreshing = true
        this.refreshPromise = AuthService.refreshToken()
          .then(() => {
            console.log('Token refreshed successfully')
          })
          .catch((error) => {
            console.error('Failed to refresh token:', error)
            throw error
          })
          .finally(() => {
            this.isRefreshing = false
            this.refreshPromise = null
          })
        
        await this.refreshPromise
      }
    }
  }

  /**
   * Créer les headers par défaut
   */
  private createHeaders(options: ApiRequestOptions = {}): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    })

    if (options.requiresAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
    }

    return headers
  }

  /**
   * Effectuer une requête avec timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408)
      }
      throw error
    }
  }

  /**
   * Méthode générique pour effectuer des requêtes
   */
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    // Vérifier et rafraîchir le token si nécessaire
    await this.ensureValidToken(options)

    const url = `${this.baseURL}${endpoint}`
    const headers = this.createHeaders(options)

    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        let errorCode = response.status.toString()
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
          errorCode = errorData.code || errorCode
        } catch {
          // Ignore JSON parsing errors
        }

        // Si c'est une erreur 401 et qu'on n'est pas déjà en train de rafraîchir le token
        if (response.status === 401 && options.requiresAuth && !options.skipTokenRefresh) {
          console.log('Received 401, attempting token refresh')
          
          try {
            // Importer dynamiquement le service d'auth
            const { AuthService } = await import('@/services/auth.service')
            
            // Essayer de rafraîchir le token
            await AuthService.refreshToken()
            
            // Réessayer la requête avec le nouveau token
            const retryOptions = { ...options, skipTokenRefresh: true }
            return this.request<T>(endpoint, retryOptions)
          } catch (refreshError) {
            // Si le refresh échoue, gérer l'expiration du token
            const { AuthService } = await import('@/services/auth.service')
            AuthService.handleTokenExpiration()
            throw new ApiError('Authentication expired', 401, 'TOKEN_EXPIRED')
          }
        }

        throw new ApiError(errorMessage, response.status, errorCode)
      }

      // Gérer les réponses vides
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return {} as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Network error', 0)
    }
  }

  /**
   * Méthodes raccourcies pour les différents types de requêtes
   */
  async get<T>(endpoint: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Instance globale du client API
export const api = new Api()
