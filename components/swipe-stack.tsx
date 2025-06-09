"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SwipeableMovieCard } from "@/components/swipeable-movie-card"
import type { Movie } from "@/types/movie"
import type { SwipeAction } from "@/types/chat"

interface SwipeStackProps {
  movies: Movie[]
  onSwipe: (action: SwipeAction, movie: Movie) => void
}

export function SwipeStack({ movies, onSwipe }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipedMovies, setSwipedMovies] = useState<Set<string>>(new Set())

  const handleSwipe = (action: SwipeAction, movie: Movie) => {
    setSwipedMovies((prev) => new Set([...prev, movie.id]))
    onSwipe(action, movie)

    // Passer au film suivant après un délai
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 300)
  }

  const currentMovie = movies[currentIndex]
  const nextMovie = movies[currentIndex + 1]
  const hasMoreMovies = currentIndex < movies.length

  if (!hasMoreMovies || !currentMovie) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-2">Tous les films évalués ! ✨</h3>
          <p className="text-gray-400">Retour à la conversation...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px]">
      {/* Progress indicator */}
      <div className="absolute -top-8 left-0 right-0 flex justify-center gap-2 z-10">
        {movies.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index < currentIndex ? "bg-green-400" : index === currentIndex ? "bg-purple-400" : "bg-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Movie cards stack */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          {/* Current card */}
          <motion.div
            key={`current-${currentMovie.id}`}
            className="absolute inset-0 z-20"
            initial={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SwipeableMovieCard movie={currentMovie} onSwipe={handleSwipe} isActive={true} enhanced={true} />
          </motion.div>

          {/* Next card preview */}
          {nextMovie && (
            <motion.div
              key={`next-${nextMovie.id}`}
              className="absolute inset-0 z-10"
              initial={{ scale: 0.95, opacity: 0.7 }}
              animate={{ scale: 0.95, opacity: 0.7 }}
              style={{ transform: "translateY(10px)" }}
            >
              <SwipeableMovieCard movie={nextMovie} onSwipe={() => {}} isActive={false} enhanced={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Counter */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <span className="text-sm text-gray-400">
          {currentIndex + 1} / {movies.length}
        </span>
      </div>
    </div>
  )
}
