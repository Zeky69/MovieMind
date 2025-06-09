import type { Movie } from "./movie"

export type SwipeAction = "like" | "dislike" | "love"

export interface SwipeData {
  movie: Movie
  action: SwipeAction
  timestamp: number
}

export interface SwipePreferences {
  liked: string[]
  loved: string[]
  disliked: string[]
  likedGenres: string[]
  dislikedGenres: string[]
}
