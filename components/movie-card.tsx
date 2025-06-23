"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Calendar, ExternalLink, Heart } from "lucide-react"
import type { Movie, LegacyMovie } from "@/types/movie"
import { 
  getMoviePosterImageUrl, 
  getMovieTitle, 
  getMovieSummary, 
  getMovieYear, 
  getMovieRating, 
  getMovieDuration, 
  getMovieGenres 
} from "@/types/movie"
import { useState } from "react"

interface MovieCardProps {
  movie: Movie | LegacyMovie
  compact?: boolean
}

export function MovieCard({ movie, compact = false }: MovieCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  const handleWatch = () => {
    // Simuler l'ouverture d'un service de streaming
    window.open(`https://www.google.com/search?q=${encodeURIComponent(getMovieTitle(movie) + " streaming")}`, "_blank")
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    // Ici on pourrait sauvegarder dans localStorage ou envoyer à une API
  }

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="bg-slate-800 border-slate-700 overflow-hidden h-full">
        {/* Poster */}
        <div className="relative">
          <img
            src={getMoviePosterImageUrl(movie)}
            alt={getMovieTitle(movie)}
            className={`w-full object-cover ${compact ? "h-32" : "h-64"}`}
          />
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleLike}
              className={`p-2 ${isLiked ? "text-red-500" : "text-slate-400"}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
          </div>
          {getMovieRating(movie) && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {getMovieRating(movie)}
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className={compact ? "p-3" : "p-4"}>
          <h3 className={`font-bold ${compact ? "text-sm" : "text-lg"} line-clamp-2`}>{getMovieTitle(movie)}</h3>
          <div className="flex items-center gap-4 text-sm text-slate-400">
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
        </CardHeader>

        {!compact && (
          <CardContent className="p-4 pt-0">
            <p className="text-slate-300 text-sm line-clamp-3 mb-3">{getMovieSummary(movie)}</p>
            <div className="flex flex-wrap gap-1">
              {getMovieGenres(movie).slice(0, 3).map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}

        <CardFooter className={`${compact ? "p-3" : "p-4"} pt-0`}>
          <div className="flex gap-2 w-full">
            <Button onClick={handleWatch} className="flex-1 flex items-center gap-2" size={compact ? "sm" : "default"}>
              <ExternalLink className="w-4 h-4" />
              Regarder
            </Button>
            {!compact && (
              <Button
                variant="outline"
                onClick={() => {
                  /* Autre suggestion */
                }}
                size="default"
              >
                Autre
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
