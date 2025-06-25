/**
 * Configuration de l'API
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  TIMEOUT: 100000,
} as const

/**
 * Configuration de l'authentification
 */
export const AUTH_CONFIG = {
  TOKEN_KEY: 'moviemind_token',
  USER_KEY: 'moviemind_user',
  TOKEN_METADATA_KEY: 'moviemind_token_metadata',
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes avant expiration
} as const
