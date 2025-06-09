export interface Movie {
  id: string
  title: string
  summary: string
  genres: string[]
  year: number
  duration: string
  rating?: number
  poster: string
  director?: string
  cast?: string[]
}
