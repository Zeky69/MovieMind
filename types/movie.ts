import { getTMDBPosterUrl, getMoviePlaceholderUrl, TMDB_IMAGE_SIZES } from '@/lib/tmdb-utils';

export interface Movie {
  id: number
  tmdb_id: number
  title: string
  original_title: string
  overview: string
  tagline?: string
  release_date: string
  genres: string[]
  directors: string[]
  cast: string[]
  keywords: string[]
  vote_average: number
  vote_count: number
  popularity: number
  runtime: number
  budget: number
  revenue: number
  original_language: string
  poster_path: string
  backdrop_path: string
  embedding_text: string
  tmdb_url: string
}

// Interface pour compatibilité avec l'ancien code
export interface LegacyMovie {
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

// Fonction pour convertir un film TMDB en format legacy si nécessaire
export function tmdbToLegacyMovie(tmdbMovie: Movie): LegacyMovie {
  return {
    id: tmdbMovie.id.toString(),
    title: tmdbMovie.title,
    summary: tmdbMovie.overview,
    genres: tmdbMovie.genres,
    year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : 0,
    duration: tmdbMovie.runtime ? `${tmdbMovie.runtime} min` : 'N/A',
    rating: tmdbMovie.vote_average,
    poster: tmdbMovie.poster_path,
    director: tmdbMovie.directors?.[0],
    cast: tmdbMovie.cast
  }
}

// Fonction helper pour obtenir l'URL complète du poster
export function getMoviePosterImageUrl(
  movie: Movie | LegacyMovie, 
  size: keyof typeof TMDB_IMAGE_SIZES.poster = "w500",
  useProxy: boolean = false
): string {
  const posterPath = 'poster_path' in movie ? movie.poster_path : movie.poster;
  
  if (!posterPath) {
    return getMoviePlaceholderUrl(movie.title);
  }
  
  // Si c'est déjà une URL complète, la retourner
  if (posterPath.startsWith('http')) {
    return posterPath;
  }
  
  // Utiliser la fonction TMDB optimisée
  const tmdbUrl = getTMDBPosterUrl(posterPath, size, useProxy);
  
  if (tmdbUrl) {
    return tmdbUrl;
  }
  
  // Fallback vers un placeholder
  return getMoviePlaceholderUrl(movie.title);
}

// Fonctions helper pour accéder aux propriétés de manière sécurisée
export function getMovieTitle(movie: Movie | LegacyMovie): string {
  return movie.title;
}

export function getMovieSummary(movie: Movie | LegacyMovie): string {
  return 'overview' in movie ? movie.overview : movie.summary;
}

export function getMovieYear(movie: Movie | LegacyMovie): number | null {
  if ('release_date' in movie) {
    return movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null;
  }
  return movie.year || null;
}

export function getMovieRating(movie: Movie | LegacyMovie): number | null {
  if ('vote_average' in movie) {
    return movie.vote_average;
  }
  return movie.rating || null;
}

export function getMovieDuration(movie: Movie | LegacyMovie): string | null {
  if ('runtime' in movie) {
    return movie.runtime ? `${movie.runtime} min` : null;
  }
  return movie.duration || null;
}

export function getMovieGenres(movie: Movie | LegacyMovie): string[] {
  return movie.genres || [];
}

export function getMovieDirector(movie: Movie | LegacyMovie): string | null {
  if ('directors' in movie) {
    return movie.directors?.[0] || null;
  }
  return movie.director || null;
}

export function getMovieCast(movie: Movie | LegacyMovie): string[] {
  return movie.cast || [];
}
