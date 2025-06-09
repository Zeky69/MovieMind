export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  createdAt: number
  followers: string[]
  following: string[]
  likedMovies: string[]
  dislikedMovies: string[]
  lovedMovies: string[]
  watchlist: string[]
}

export interface UserProfile {
  user: User
  isFollowing: boolean
  mutualFriends: User[]
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
}
