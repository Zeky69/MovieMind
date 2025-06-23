"use client"

import { useState } from "react"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Calendar, Heart, X, Zap } from "lucide-react"
import type { Movie, LegacyMovie } from "@/types/movie"
import { 
  getMoviePosterImageUrl, 
  getMovieTitle, 
  getMovieSummary, 
  getMovieYear, 
  getMovieRating, 
  getMovieDuration, 
  getMovieGenres,
  getMovieDirector,
  getMovieCast
} from "@/types/movie"
import type { SwipeAction } from "@/types/chat"

interface SwipeCardProps {
  movie: Movie | LegacyMovie
  onSwipe: (action: SwipeAction, movie: Movie | LegacyMovie) => void
  isActive: boolean
}

export function SwipeCard({ movie, onSwipe, isActive }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0)
  const [exitY, setExitY] = useState(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateZ = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    const velocityThreshold = 500

    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocityThreshold) {
      if (info.offset.x > 0) {
        setExitX(300)
        onSwipe("like", movie)
      } else {
        setExitX(-300)
        onSwipe("dislike", movie)
      }
    } else if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
      setExitY(-300)
      onSwipe("love", movie)
    }
  }

  const handleButtonAction = (action: SwipeAction) => {
    switch (action) {
      case "dislike":
        setExitX(-300)
        break
      case "like":
        setExitX(300)
        break
      case "love":
        setExitY(-300)
        break
    }
    onSwipe(action, movie)
  }

  return (
    <motion.div
      className="w-full h-full cursor-grab active:cursor-grabbing"
      style={{ x, y, rotateZ, opacity }}
      drag={isActive}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX, y: exitY }}
      exit={{ x: exitX, y: exitY, opacity: 0 }}
      transition={{ duration: 0.3 }}
      whileDrag={{ scale: 1.05 }}
    >
      <div className="card-modern w-full h-full rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Movie Poster */}
        <div className="relative h-3/5 overflow-hidden">
          <img
            src={getMoviePosterImageUrl(movie)}
            alt={getMovieTitle(movie)}
            className="w-full h-full object-contain"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Swipe Indicators */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: useTransform(x, [50, 200], [0, 1]) }}
          >
            <div className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl transform rotate-12 shadow-2xl">
              J'AIME ❤️
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: useTransform(x, [-200, -50], [1, 0]) }}
          >
            <div className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl transform -rotate-12 shadow-2xl">
              NOPE ❌
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: useTransform(y, [-200, -50], [1, 0]) }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl shadow-2xl">
              COUP DE CŒUR ! ⚡
            </div>
          </motion.div>

          {/* Rating Badge */}
          {getMovieRating(movie) && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-black/50 text-white border-white/20 px-3 py-1 backdrop-blur-sm">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                {getMovieRating(movie)}
              </Badge>
            </div>
          )}

          {/* Quick Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-bold text-2xl text-white mb-2 line-clamp-2">{getMovieTitle(movie)}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-200">
              {getMovieYear(movie) && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {getMovieYear(movie)}
                </span>
              )}
              {getMovieDuration(movie) && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getMovieDuration(movie)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Movie Details */}
        <div className="p-6 h-2/5 flex flex-col justify-between">
          <div className="space-y-3">
            <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">{getMovieSummary(movie)}</p>

            {getMovieDirector(movie) && (
              <div className="text-xs text-gray-400">
                <span className="font-medium text-purple-400">Réalisateur:</span> {getMovieDirector(movie)}
              </div>
            )}

            {getMovieCast(movie) && getMovieCast(movie).length > 0 && (
              <div className="text-xs text-gray-400">
                <span className="font-medium text-purple-400">Avec:</span> {getMovieCast(movie).slice(0, 2).join(", ")}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {getMovieGenres(movie).slice(0, 3).map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs border-purple-400/30 text-purple-300">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {isActive && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => handleButtonAction("dislike")}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg transition-all duration-300 py-2 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Non
              </Button>

              <Button
                size="sm"
                onClick={() => handleButtonAction("love")}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-lg transition-all duration-300 shadow-lg py-2 text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                Coup de ❤️
              </Button>

              <Button
                size="sm"
                onClick={() => handleButtonAction("like")}
                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg transition-all duration-300 py-2 text-xs"
              >
                <Heart className="w-3 h-3 mr-1" />
                J'aime
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
