"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MovieCard } from "@/components/movie-card"
import { RefreshCw, Search, Heart, X, Zap, ArrowLeft } from "lucide-react"
import type { SwipeData } from "@/types/swipe"
import { getMovieRecommendations } from "@/lib/api"
import { useRouter } from "next/navigation"

interface SwipeResultsProps {
  swipeData: SwipeData[]
  searchData: any
  onRestart: () => void
  onNewSearch: () => void
}

export function SwipeResults({ swipeData, searchData, onRestart, onNewSearch }: SwipeResultsProps) {
  const [refinementText, setRefinementText] = useState("")
  const [isRefining, setIsRefining] = useState(false)
  const [newRecommendations, setNewRecommendations] = useState<any[]>([])
  const [showNewRecommendations, setShowNewRecommendations] = useState(false)
  const router = useRouter()

  const likedMovies = swipeData.filter((s) => s.action === "like")
  const lovedMovies = swipeData.filter((s) => s.action === "love")
  const dislikedMovies = swipeData.filter((s) => s.action === "dislike")

  const handleRefineSearch = async () => {
    setIsRefining(true)
    try {
      // Créer un prompt enrichi basé sur les préférences
      const preferences = {
        liked: likedMovies.map((s) => s.movie.title),
        loved: lovedMovies.map((s) => s.movie.title),
        disliked: dislikedMovies.map((s) => s.movie.title),
        likedGenres: [...new Set(likedMovies.flatMap((s) => s.movie.genres))],
        dislikedGenres: [...new Set(dislikedMovies.flatMap((s) => s.movie.genres))],
      }

      let enrichedPrompt = refinementText || searchData.prompt

      if (preferences.liked.length > 0) {
        enrichedPrompt += ` (j'ai aimé des films comme ${preferences.liked.join(", ")})`
      }
      if (preferences.loved.length > 0) {
        enrichedPrompt += ` (j'adore des films comme ${preferences.loved.join(", ")})`
      }
      if (preferences.disliked.length > 0) {
        enrichedPrompt += ` (éviter des films comme ${preferences.disliked.join(", ")})`
      }

      const recommendations = await getMovieRecommendations(enrichedPrompt, searchData.isGroupMode)
      setNewRecommendations(recommendations)
      setShowNewRecommendations(true)

      // Sauvegarder la recherche affinée
      localStorage.setItem(
        "currentSearch",
        JSON.stringify({
          prompt: enrichedPrompt,
          isGroupMode: searchData.isGroupMode,
          timestamp: Date.now(),
          refined: true,
          preferences,
        }),
      )
    } catch (error) {
      console.error("Erreur lors de l'affinement:", error)
    } finally {
      setIsRefining(false)
    }
  }

  const handleGetMoreRecommendations = async () => {
    setIsRefining(true)
    try {
      const recommendations = await getMovieRecommendations(searchData.prompt, searchData.isGroupMode)
      setNewRecommendations(recommendations)
      setShowNewRecommendations(true)
    } catch (error) {
      console.error("Erreur lors de la génération:", error)
    } finally {
      setIsRefining(false)
    }
  }

  const handleContinueWithNew = () => {
    // Rediriger vers la page de résultats avec les nouvelles recommandations
    router.push("/results")
  }

  if (showNewRecommendations) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => setShowNewRecommendations(false)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux résultats
            </Button>
            <Button onClick={handleContinueWithNew} className="flex items-center gap-2">
              Continuer le swipe
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <h2 className="text-2xl font-bold mb-6">Nouvelles recommandations</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newRecommendations.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Résultats de votre session</h1>
          <p className="text-slate-400">Voici un résumé de vos préférences</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-red-500/10 border-red-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <X className="w-5 h-5" />
                  Pas intéressé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400 mb-2">{dislikedMovies.length}</div>
                <div className="space-y-1">
                  {dislikedMovies.slice(0, 2).map((item) => (
                    <div key={item.movie.id} className="text-sm text-slate-400 truncate">
                      {item.movie.title}
                    </div>
                  ))}
                  {dislikedMovies.length > 2 && (
                    <div className="text-xs text-slate-500">+{dislikedMovies.length - 2} autres</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <Zap className="w-5 h-5" />
                  Bingo !
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400 mb-2">{lovedMovies.length}</div>
                <div className="space-y-1">
                  {lovedMovies.slice(0, 2).map((item) => (
                    <div key={item.movie.id} className="text-sm text-slate-400 truncate">
                      {item.movie.title}
                    </div>
                  ))}
                  {lovedMovies.length > 2 && (
                    <div className="text-xs text-slate-500">+{lovedMovies.length - 2} autres</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-green-500/10 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Heart className="w-5 h-5" />
                  J'aime bien
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400 mb-2">{likedMovies.length}</div>
                <div className="space-y-1">
                  {likedMovies.slice(0, 2).map((item) => (
                    <div key={item.movie.id} className="text-sm text-slate-400 truncate">
                      {item.movie.title}
                    </div>
                  ))}
                  {likedMovies.length > 2 && (
                    <div className="text-xs text-slate-500">+{likedMovies.length - 2} autres</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Preferred Genres */}
        {(likedMovies.length > 0 || lovedMovies.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-slate-800 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle>Vos genres préférés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[...new Set([...likedMovies, ...lovedMovies].flatMap((s) => s.movie.genres))].map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Refinement Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle>Affiner votre recherche</CardTitle>
              <p className="text-slate-400 text-sm">Décrivez plus précisément ce que vous recherchez maintenant</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={refinementText}
                onChange={(e) => setRefinementText(e.target.value)}
                placeholder="Ex: Quelque chose de plus récent, avec plus d'action, moins sombre..."
                className="min-h-[100px] bg-slate-700 border-slate-600"
              />
              <Button onClick={handleRefineSearch} disabled={isRefining} className="w-full flex items-center gap-2">
                {isRefining ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Affiner la recherche
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={handleGetMoreRecommendations}
            disabled={isRefining}
            variant="outline"
            className="flex-1 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Plus de recommandations
          </Button>
          <Button onClick={onRestart} variant="outline" className="flex-1">
            Recommencer le swipe
          </Button>
          <Button onClick={onNewSearch} className="flex-1">
            Nouvelle recherche
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
