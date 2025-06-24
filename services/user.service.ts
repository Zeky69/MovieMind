import { api } from '@/lib/api'
import type { 
  User, 
  UserUpdate, 
  FollowStats, 
  IsFollowingResponse, 
  MutualFollowsResponse,
  SuggestedUsersResponse
} from '@/types/user'

/**
 * Service de gestion des utilisateurs
 */
export class UserService {
  /**
   * Récupérer son propre profil
   */
  static async getMyProfile(): Promise<User> {
    return await api.get<User>('/users/me', { requiresAuth: true })
  }

  /**
   * Mettre à jour son profil
   */
  static async updateMyProfile(userData: UserUpdate): Promise<User> {
    return await api.put<User>('/users/me', userData, { requiresAuth: true })
  }
  /**
   * Récupérer le profil d'un utilisateur par son ID
   */
  static async getUserProfile(userId: string): Promise<User> {
    return await api.get<User>(`/users/${userId}`, { requiresAuth: true })
  }  /**
   * Récupérer des suggestions d'utilisateurs à suivre
   */
  static async getSuggestedUsers(limit: number = 10): Promise<SuggestedUsersResponse> {
    const users = await api.get<User[]>(
      `/users/suggestions?limit=${limit}`, 
      { requiresAuth: true }
    )
    
    console.log('Suggested users received:', users)
    
    return {
      suggestions: users,
      total: users.length
    }
  }/**
   * Suivre un utilisateur
   */
  static async followUser(userId: string): Promise<{ message: string }> {
    return await api.post<{ message: string }>(`/users/follow/${userId}`, {}, { requiresAuth: true })
  }

  /**
   * Ne plus suivre un utilisateur
   */
  static async unfollowUser(userId: string): Promise<{ message: string }> {
    return await api.delete<{ message: string }>(`/users/unfollow/${userId}`, { requiresAuth: true })
  }  /**
   * Récupérer la liste des followers d'un utilisateur
   */
  static async getUserFollowers(userId: string): Promise<User[]> {
    return await api.get<User[]>(`/users/${userId}/followers`, { requiresAuth: true })
  }
  /**
   * Récupérer la liste des utilisateurs suivis par un utilisateur
   */
  static async getUserFollowing(userId: string): Promise<User[]> {
    return await api.get<User[]>(`/users/${userId}/following`, { requiresAuth: true })
  }  /**
   * Récupérer les statistiques de suivi d'un utilisateur
   */
  static async getUserFollowStats(userId: string): Promise<FollowStats> {
    return await api.get<FollowStats>(`/users/${userId}/follow-stats`, { requiresAuth: true })
  }
  /**
   * Vérifier si on suit un utilisateur
   */
  static async isFollowingUser(userId: string): Promise<IsFollowingResponse> {
    return await api.get<IsFollowingResponse>(`/users/${userId}/is-following`, { requiresAuth: true })
  }

  /**
   * Récupérer les relations de suivi mutuelles avec un utilisateur
   * Note: Endpoint temporaire - le backend devrait implémenter /users/mutual-follows/{userId}
   */
  static async getMutualFollows(userId: string): Promise<MutualFollowsResponse> {
    // TODO: Implémenter cet endpoint dans le backend
    return {
      user_id: "",
      target_user_id: userId,
      is_following: false,
      is_followed_by: false,
      is_mutual: false
    }
  }
  /**
   * Rechercher des utilisateurs
   */
  static async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    return await api.get<User[]>(`/users/search/${encodeURIComponent(query)}?limit=${limit}`, { requiresAuth: true })
  }
}

// Export des méthodes principales pour une utilisation directe
export const {
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  getSuggestedUsers,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  getUserFollowStats,
  isFollowingUser,
  getMutualFollows,
  searchUsers
} = UserService
