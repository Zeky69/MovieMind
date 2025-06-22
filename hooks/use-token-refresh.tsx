'use client'

import { useEffect, useCallback } from 'react'
import { AuthService } from '@/services/auth.service'
import { useAuth } from '@/contexts/auth-context'

/**
 * Hook pour gérer le refresh automatique du token
 * Ce hook peut être utilisé dans des composants spécifiques qui ont besoin
 * d'un contrôle plus fin sur le refresh du token
 */
export function useTokenRefresh() {
  const { isAuthenticated, logout } = useAuth()

  /**
   * Vérifier manuellement si le token doit être rafraîchi
   */
  const checkTokenStatus = useCallback(() => {
    if (!isAuthenticated) return { shouldRefresh: false, isExpired: false }
    
    return {
      shouldRefresh: AuthService.shouldRefreshToken(),
      isExpired: AuthService.isTokenExpired()
    }
  }, [isAuthenticated])

  /**
   * Rafraîchir manuellement le token
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      await AuthService.refreshToken()
      return true
    } catch (error) {
      console.error('Manual token refresh failed:', error)
      await logout()
      return false
    }
  }, [isAuthenticated, logout])

  /**
   * Forcer la vérification du token au montage du composant
   */
  useEffect(() => {
    if (isAuthenticated) {
      const { isExpired } = checkTokenStatus()
      if (isExpired) {
        console.log('Token expired on component mount, logging out')
        logout()
      }
    }
  }, [isAuthenticated, checkTokenStatus, logout])

  return {
    checkTokenStatus,
    refreshToken,
    isAuthenticated
  }
}

/**
 * Hook pour exécuter une action périodique de vérification du token
 * Utile pour les composants qui restent ouverts longtemps
 */
export function usePeriodicTokenCheck(intervalMs: number = 60000) { // 1 minute par défaut
  const { isAuthenticated } = useAuth()
  const { checkTokenStatus, refreshToken } = useTokenRefresh()

  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(async () => {
      const { shouldRefresh, isExpired } = checkTokenStatus()
      
      if (isExpired) {
        console.log('Token expired during periodic check')
        return // Le hook useTokenRefresh se chargera de la déconnexion
      }
      
      if (shouldRefresh) {
        console.log('Token needs refresh during periodic check')
        await refreshToken()
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [isAuthenticated, intervalMs, checkTokenStatus, refreshToken])
}
