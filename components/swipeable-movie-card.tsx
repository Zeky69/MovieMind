"use client"

import { useState } from "react"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Calendar, Heart, X, Zap } from "lucide-react"
import type { Movie } from "@/types/movie"
import type { SwipeAction } from "@/types/swipe"

interface SwipeableMovieCardProps {
  movie: Movie
  onSwipe: (action: SwipeAction, movie: Movie) => void
  isActive: boolean
  enhanced?: boolean
}

export function SwipeableMovieCard({ movie, onSwipe, isActive, enhanced = false }: SwipeableMovieCardProps) {
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
        {/* Poster */}
        <div className="relative h-3/5 overflow-hidden">
          <img
            src={movie.poster || "/placeholder.svg?height=600&width=400"}
            alt={movie.title}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Swipe Indicators */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: useTransform(x, [50, 200], [0, 1]) }}
          >
            <div className="gradient-success text-white px-8 py-4 rounded-2xl font-bold text-2xl transform rotate-12 shadow-glow-cyan">
              J'AIME ❤️
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: useTransform(x, [-200, -50], [1, 0]) }}
          >
            <div className="gradient-secondary text-white px-8 py-4 rounded-2xl font-bold text-2xl transform -rotate-12 shadow-glow-pink">
              NOPE ❌
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: useTransform(y, [-200, -50], [1, 0]) }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl shadow-glow">
              BINGO ! ⚡
            </div>
          </motion.div>

          {/* Rating Badge */}
          {movie.rating && (
            <div className="absolute top-4 left-4">
              <Badge className="glass text-white border-white/20 px-3 py-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                {movie.rating}
              </Badge>
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="p-6 h-2/5 flex flex-col justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-xl line-clamp-2 mb-3 text-white">{movie.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
              {movie.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {movie.year}
                </span>
              )}
              {movie.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {movie.duration}
                </span>
              )}
            </div>
            <p className="text-gray-300 text-sm line-clamp-2 mb-3">{movie.summary}</p>

            {/* Enhanced info for chat */}
            {enhanced && (
              <div className="space-y-1 mb-3">
                {movie.director && (
                  <div className="text-xs text-gray-400">
                    <span className="font-medium">Réalisateur:</span> {movie.director}
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div className="text-xs text-gray-400">
                    <span className="font-medium">Avec:</span> {movie.cast.slice(0, 2).join(", ")}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {movie.genres.slice(0, 3).map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs border-white/20 text-gray-300">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        {isActive && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => handleButtonAction("dislike")}
                className="btn-modern flex-1 gradient-secondary text-white shadow-glow-pink hover:scale-105 transition-all duration-300 rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Non
              </Button>

              <Button
                onClick={() => handleButtonAction("love")}
                className="btn-modern flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-glow hover:scale-105 transition-all duration-300 rounded-xl"
              >
                <Zap className="w-4 h-4 mr-2" />
                Bingo !
              </Button>

              <Button
                onClick={() => handleButtonAction("like")}
                className="btn-modern flex-1 gradient-success text-white shadow-glow-cyan hover:scale-105 transition-all duration-300 rounded-xl"
              >
                <Heart className="w-4 h-4 mr-2" />
                J'aime
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
