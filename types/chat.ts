import type { Movie } from "./movie"

export type SwipeAction = "like" | "dislike" | "love"

export interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: number
  movie?: Movie
  movies?: Movie[] // Pour afficher plusieurs films
  swipeable?: boolean
  finalRecommendation?: boolean
  showRefinementOptions?: boolean
  isTyping?: boolean
}
