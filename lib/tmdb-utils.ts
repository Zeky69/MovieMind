/**
 * Utilitaires pour TMDB (The Movie Database)
 */

// Base URL pour les images TMDB
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Tailles d'images disponibles
export const TMDB_IMAGE_SIZES = {
  backdrop: {
    w300: "w300",
    w780: "w780",
    w1280: "w1280",
    original: "original",
  },
  poster: {
    w92: "w92",
    w154: "w154",
    w185: "w185",
    w342: "w342",
    w500: "w500",
    w780: "w780",
    original: "original",
  },
} as const;

/**
 * Génère l'URL complète pour un poster TMDB
 * @param posterPath - Le chemin du poster (ex: "/abc123.jpg")
 * @param size - La taille désirée (défaut: w500)
 * @param useProxy - Utiliser le proxy local au lieu de l'URL directe TMDB (défaut: false)
 * @returns URL complète du poster ou null si le chemin est invalide
 */
export function getTMDBPosterUrl(
  posterPath: string | null | undefined,
  size: keyof typeof TMDB_IMAGE_SIZES.poster = "w500",
  useProxy: boolean = false
): string | null {
  if (!posterPath) return null;
  
  // Nettoyer le chemin (enlever le slash initial s'il est présent)
  const cleanPath = posterPath.startsWith("/") ? posterPath.slice(1) : posterPath;
  
  if (useProxy) {
    return `/api/tmdb-image/${TMDB_IMAGE_SIZES.poster[size]}/${cleanPath}`;
  }
  
  return `${TMDB_IMAGE_BASE_URL}/${TMDB_IMAGE_SIZES.poster[size]}/${cleanPath}`;
}

/**
 * Génère l'URL complète pour un backdrop TMDB
 * @param backdropPath - Le chemin du backdrop (ex: "/abc123.jpg")
 * @param size - La taille désirée (défaut: w1280)
 * @param useProxy - Utiliser le proxy local au lieu de l'URL directe TMDB (défaut: false)
 * @returns URL complète du backdrop ou null si le chemin est invalide
 */
export function getTMDBBackdropUrl(
  backdropPath: string | null | undefined,
  size: keyof typeof TMDB_IMAGE_SIZES.backdrop = "w1280",
  useProxy: boolean = false
): string | null {
  if (!backdropPath) return null;
  
  // Nettoyer le chemin
  const cleanPath = backdropPath.startsWith("/") ? backdropPath.slice(1) : backdropPath;
  
  if (useProxy) {
    return `/api/tmdb-image/${TMDB_IMAGE_SIZES.backdrop[size]}/${cleanPath}`;
  }
  
  return `${TMDB_IMAGE_BASE_URL}/${TMDB_IMAGE_SIZES.backdrop[size]}/${cleanPath}`;
}

/**
 * Génère une URL d'image placeholder pour les films sans poster
 * @param title - Titre du film pour le texte alternatif
 * @param width - Largeur de l'image (défaut: 500)
 * @param height - Hauteur de l'image (défaut: 750) 
 * @returns URL du placeholder
 */
export function getMoviePlaceholderUrl(
  title: string = "Film sans poster",
  width: number = 500,
  height: number = 750
): string {
  return `/api/placeholder?text=${encodeURIComponent(title)}&width=${width}&height=${height}`;
}

/**
 * Fonction helper pour obtenir l'URL du poster d'un film avec fallback
 * @param movie - Objet film avec poster_path
 * @param size - Taille désirée
 * @param useProxy - Utiliser le proxy local (défaut: false)
 * @returns URL du poster ou placeholder
 */
export function getMoviePosterUrl(
  movie: { poster_path?: string | null; title: string },
  size: keyof typeof TMDB_IMAGE_SIZES.poster = "w500",
  useProxy: boolean = false
): string {
  const tmdbUrl = getTMDBPosterUrl(movie.poster_path, size, useProxy);
  
  if (tmdbUrl) {
    return tmdbUrl;
  }
  
  // Fallback vers un placeholder
  return getMoviePlaceholderUrl(movie.title);
}
