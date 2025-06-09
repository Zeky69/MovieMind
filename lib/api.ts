import type { Movie } from "@/types/movie"
import { mockMovies } from "@/data/mock-movies"

export async function getMovieRecommendations(prompt: string, isGroupMode = false): Promise<Movie[]> {
  // Simuler un délai d'API
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

  // Simuler une sélection intelligente basée sur le prompt
  const shuffled = [...mockMovies].sort(() => Math.random() - 0.5)

  // Retourner 3-6 films aléatoirement
  const count = Math.floor(Math.random() * 4) + 3
  return shuffled.slice(0, count)
}

export async function searchMovies(query: string): Promise<Movie[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockMovies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.genres.some((genre) => genre.toLowerCase().includes(query.toLowerCase())),
  )
}
