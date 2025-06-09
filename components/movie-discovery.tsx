"use client"

import { motion, AnimatePresence } from "framer-motion"
import { SwipeCard } from "@/components/swipe-card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp } from "lucide-react"
import type { Movie } from "@/types/movie"
import type { SwipeAction } from "@/types/chat"

interface MovieDiscoveryProps {
  movies: Movie[]
  currentIndex: number
  onSwipe: (action: SwipeAction, movie: Movie) => void
  userPreferences: {
    liked: Movie[]
    disliked: Movie[]
    loved: Movie[]
  }
  searchPrompt?: string
}

export function MovieDiscovery({ movies, currentIndex, onSwipe, userPreferences, searchPrompt }: MovieDiscoveryProps) {
  const currentMovie = movies[currentIndex]
  const nextMovie = movies[currentIndex + 1]
  const progress = ((currentIndex + 1) / movies.length) * 100

  if (!currentMovie) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full glass flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Tous les films explorés !</h2>
          <p className="text-gray-400 mb-6">
            Vous avez évalué tous nos films. Voulez-vous affiner votre recherche pour découvrir d'autres pépites ?
          </p>
          <Button className="gradient-primary text-white px-8 py-3 rounded-2xl">
            <TrendingUp className="w-4 h-4 mr-2" />
            Affiner ma recherche
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress & Info Bar */}
      <div className="p-4 space-y-4">
        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Progression</span>
            <span>
              {currentIndex + 1} / {movies.length}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Search Context */}
        {searchPrompt && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="glass rounded-2xl p-3 max-w-lg mx-auto">
              <p className="text-sm text-gray-300">
                <span className="text-purple-400">Recherche:</span> "{searchPrompt}"
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <div className="text-green-400 font-bold text-lg">{userPreferences.liked.length}</div>
            <div className="text-gray-400">Aimés</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-lg">{userPreferences.loved.length}</div>
            <div className="text-gray-400">Coups de ❤️</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-bold text-lg">{userPreferences.disliked.length}</div>
            <div className="text-gray-400">Rejetés</div>
          </div>
        </div>
      </div>

      {/* Movie Cards */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm h-[600px]">
          <AnimatePresence mode="wait">
            {/* Current Movie */}
            <motion.div
              key={`current-${currentMovie.id}`}
              className="absolute inset-0 z-20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SwipeCard movie={currentMovie} onSwipe={onSwipe} isActive={true} />
            </motion.div>

            {/* Next Movie Preview */}
            {nextMovie && (
              <motion.div
                key={`next-${nextMovie.id}`}
                className="absolute inset-0 z-10"
                initial={{ scale: 0.85, opacity: 0.5 }}
                animate={{ scale: 0.85, opacity: 0.5 }}
                style={{ transform: "translateY(20px)" }}
              >
                <SwipeCard movie={nextMovie} onSwipe={() => {}} isActive={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-3"
        >
          <p className="text-sm text-gray-400">Swipez ou utilisez les boutons pour évaluer</p>
          <div className="flex justify-center gap-6 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>← Pas intéressé
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>↑ Coup de cœur
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>→ J'aime bien
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
