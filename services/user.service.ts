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
  static async getUserProfile(userId: number): Promise<User> {
    return await api.get<User>(`/users/${userId}`, { requiresAuth: true })
  }

  /**
   * Récupérer des suggestions d'utilisateurs à suivre
   */
  static async getSuggestedUsers(limit: number = 10): Promise<SuggestedUsersResponse> {
    return await api.get<SuggestedUsersResponse>(
      `/users/suggested?limit=${limit}`, 
      { requiresAuth: true }
    )
  }

  /**
   * Suivre un utilisateur
   */
  static async followUser(userId: number): Promise<{ message: string }> {
    return await api.post<{ message: string }>(`/users/${userId}/follow`, {}, { requiresAuth: true })
  }

  /**
   * Ne plus suivre un utilisateur
   */
  static async unfollowUser(userId: number): Promise<{ message: string }> {
    return await api.delete<{ message: string }>(`/users/${userId}/follow`, { requiresAuth: true })
  }

  /**
   * Récupérer la liste des followers d'un utilisateur
   */
  static async getUserFollowers(userId: number): Promise<User[]> {
    return await api.get<User[]>(`/users/${userId}/followers`, { requiresAuth: true })
  }

  /**
   * Récupérer la liste des utilisateurs suivis par un utilisateur
   */
  static async getUserFollowing(userId: number): Promise<User[]> {
    return await api.get<User[]>(`/users/${userId}/following`, { requiresAuth: true })
  }

  /**
   * Récupérer les statistiques de suivi d'un utilisateur
   */
  static async getUserFollowStats(userId: number): Promise<FollowStats> {
    return await api.get<FollowStats>(`/users/${userId}/follow-stats`, { requiresAuth: true })
  }

  /**
   * Vérifier si on suit un utilisateur
   */
  static async isFollowingUser(userId: number): Promise<IsFollowingResponse> {
    return await api.get<IsFollowingResponse>(`/users/${userId}/is-following`, { requiresAuth: true })
  }

  /**
   * Récupérer les relations de suivi mutuelles avec un utilisateur
   */
  static async getMutualFollows(userId: number): Promise<MutualFollowsResponse> {
    return await api.get<MutualFollowsResponse>(`/users/mutual-follows/${userId}`, { requiresAuth: true })
  }

  /**
   * Rechercher des utilisateurs (cette fonction pourrait être ajoutée côté backend)
   */
  static async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    // Cette route n'existe pas encore côté backend
    // Vous pourriez l'ajouter plus tard
    return await api.get<User[]>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`, { requiresAuth: true })
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
