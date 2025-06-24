'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserService } from '@/services/user.service'
import type { 
  User, 
  UserUpdate, 
  FollowStats, 
  IsFollowingResponse, 
  MutualFollowsResponse,
  SuggestedUsersResponse
} from '@/types/user'

/**
 * Hook pour récupérer et gérer le profil d'un utilisateur
 */
export function useUserProfile(userId?: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async (id?: string) => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const userData = await UserService.getUserProfile(id)
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId) {
      fetchUser(userId)
    }
  }, [userId, fetchUser])

  return {
    user,
    loading,
    error,
    refetch: () => fetchUser(userId)
  }
}

/**
 * Hook pour gérer son propre profil
 */
export function useMyProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMyProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await UserService.getMyProfile()
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updateData: UserUpdate) => {
    try {
      setLoading(true)
      setError(null)
      const updatedUser = await UserService.updateMyProfile(updateData)
      setUser(updatedUser)
      return updatedUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyProfile()
  }, [fetchMyProfile])

  return {
    user,
    loading,
    error,
    updateProfile,
    refetch: fetchMyProfile
  }
}

/**
 * Hook pour gérer les relations de suivi
 */
export function useFollow(userId: string) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkFollowStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await UserService.isFollowingUser(userId)
      setIsFollowing(response.is_following)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la vérification')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const toggleFollow = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (isFollowing) {
        await UserService.unfollowUser(userId)
        setIsFollowing(false)
      } else {
        await UserService.followUser(userId)
        setIsFollowing(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'action')
      throw err
    } finally {
      setLoading(false)
    }
  }, [userId, isFollowing])

  useEffect(() => {
    checkFollowStatus()
  }, [checkFollowStatus])

  return {
    isFollowing,
    loading,
    error,
    toggleFollow,
    refetch: checkFollowStatus
  }
}

/**
 * Hook pour récupérer les statistiques de suivi
 */
export function useFollowStats(userId: string) {
  const [stats, setStats] = useState<FollowStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const statsData = await UserService.getUserFollowStats(userId)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}

/**
 * Hook pour récupérer les followers/following d'un utilisateur
 */
export function useUserConnections(userId: string, type: 'followers' | 'following') {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = type === 'followers' 
        ? await UserService.getUserFollowers(userId)
        : await UserService.getUserFollowing(userId)
      
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [userId, type])

  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  return {
    users,
    loading,
    error,
    refetch: fetchConnections
  }
}

/**
 * Hook pour récupérer les suggestions d'utilisateurs
 */
export function useSuggestedUsers(limit: number = 10) {
  const [suggestions, setSuggestions] = useState<SuggestedUsersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await UserService.getSuggestedUsers(limit)
      console.log('Suggestions hook received:', data)
      setSuggestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des suggestions')
      setSuggestions(null)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  return {
    suggestions,
    loading,
    error,
    refetch: fetchSuggestions
  }
}

/**
 * Hook pour la recherche d'utilisateurs
 */
export function useUserSearch() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchUsers = useCallback(async (query: string, limit: number = 20) => {
    if (!query.trim()) {
      setUsers([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const results = await UserService.searchUsers(query, limit)
      setUsers(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setUsers([])
    setError(null)
  }, [])

  return {
    users,
    loading,
    error,
    searchUsers,
    clearSearch
  }
}
