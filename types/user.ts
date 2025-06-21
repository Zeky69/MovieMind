export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  bio?: string
  is_active: boolean
  created_at: string
}

export interface UserCreate {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface UserUpdate {
  username?: string
  first_name?: string
  last_name?: string
  bio?: string
}

export interface Token {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface UserProfile {
  user: User
  isFollowing: boolean
  mutualFriends: User[]
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

export interface FollowStats {
  user_id: number
  followers_count: number
  following_count: number
}

export interface IsFollowingResponse {
  is_following: boolean
  follower_id: number
  followed_id: number
}

export interface MutualFollowsResponse {
  user_id: number
  target_user_id: number
  is_following: boolean
  is_followed_by: boolean
  is_mutual: boolean
}

export interface SuggestedUsersResponse {
  suggestions: User[]
  total: number
}
