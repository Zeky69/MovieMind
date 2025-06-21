"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { getMovieRecommendations } from "@/lib/movie-api"
import { Loader } from "@/components/loader"
import { MovieDiscovery } from "@/components/movie-discovery"
import { ConversationPanel } from "@/components/conversation-panel"
import type { Movie } from "@/types/movie"
import type { SwipeAction } from "@/types/chat"
import { useAuth } from "@/contexts/auth-context"
import type { User } from "@/types/user"

export default function ResultsPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchData, setSearchData] = useState<any>(null)
  const [showConversation, setShowConversation] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<string[]>([])
  const [userPreferences, setUserPreferences] = useState({
    liked: [] as Movie[],
    disliked: [] as Movie[],
    loved: [] as Movie[],
  })
  const { user: currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const initializeDiscovery = async () => {
      try {
        const stored = localStorage.getItem("currentSearch")
        if (!stored) {
          router.push("/")
          return
        }

        const data = JSON.parse(stored)
        setSearchData(data)

        const recommendations = await getMovieRecommendations(data.prompt, data.isGroupMode)
        setMovies(recommendations)

        // Ajouter le prompt initial à l'historique
        setConversationHistory([`Recherche initiale: "${data.prompt}"`])
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeDiscovery()
  }, [router])

  const handleSwipe = (action: SwipeAction, movie: Movie) => {
    // Save to user preferences if logged in
    // TODO: Implémenter la sauvegarde des préférences utilisateur via le backend
    // if (currentUser) {
    //   if (action === "like") {
    //     addMovieToUserList(currentUser.id, movie.id, "liked")
    //   } else if (action === "dislike") {
    //     addMovieToUserList(currentUser.id, movie.id, "disliked")
    //   } else if (action === "love") {
    //     addMovieToUserList(currentUser.id, movie.id, "loved")
    //   }
    // }

    const newPreferences = { ...userPreferences }

    switch (action) {
      case "like":
        newPreferences.liked.push(movie)
        break
      case "dislike":
        newPreferences.disliked.push(movie)
        break
      case "love":
        newPreferences.loved.push(movie)
        handleMovieSelected(movie)
        return
    }

    setUserPreferences(newPreferences)

    // Ajouter à l'historique de conversation
    const actionText = {
      like: `✅ J'ai aimé "${movie.title}"`,
      dislike: `❌ Je n'ai pas aimé "${movie.title}"`,
      love: `💖 Coup de cœur pour "${movie.title}"`,
    }

    setConversationHistory((prev) => [...prev, actionText[action]])

    // Passer au film suivant
    if (currentMovieIndex < movies.length - 1) {
      setCurrentMovieIndex((prev) => prev + 1)
    } else {
      // Fin des films, proposer d'affiner
      setShowConversation(true)
    }
  }

  const handleMovieSelected = (movie: Movie) => {
    // Rediriger vers une page de détails ou afficher les liens de streaming
    setConversationHistory((prev) => [...prev, `🎯 Film sélectionné: "${movie.title}"`])
    // Ici on pourrait ouvrir une modal avec les liens de streaming
  }

  const handleRefineSearch = async (refinement: string) => {
    setConversationHistory((prev) => [...prev, `🔍 Affinement: "${refinement}"`])
    setShowConversation(false)
    setIsLoading(true)

    try {
      const enrichedPrompt = createEnrichedPrompt(refinement)
      const newMovies = await getMovieRecommendations(enrichedPrompt, searchData.isGroupMode)
      setMovies(newMovies)
      setCurrentMovieIndex(0)
    } catch (error) {
      console.error("Erreur lors de l'affinement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createEnrichedPrompt = (userInput: string) => {
    let prompt = `${searchData.prompt} ${userInput}`

    if (userPreferences.liked.length > 0) {
      const likedTitles = userPreferences.liked.map((m) => m.title).join(", ")
      prompt += ` (films aimés: ${likedTitles})`
    }

    if (userPreferences.disliked.length > 0) {
      const dislikedTitles = userPreferences.disliked.map((m) => m.title).join(", ")
      prompt += ` (films rejetés: ${dislikedTitles})`
    }

    return prompt
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header simplifié */}
      <motion.header
        className="glass border-b border-white/10 p-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button onClick={() => router.push("/")} variant="ghost" className="flex items-center gap-2 text-gray-300">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>

          <div className="text-center">
            <h1 className="font-bold text-xl gradient-text">Découverte de Films</h1>
            <p className="text-xs text-gray-400">Swipez pour découvrir votre film parfait</p>
          </div>

          <Button
            onClick={() => setShowConversation(!showConversation)}
            variant="ghost"
            className="flex items-center gap-2 text-gray-300 relative"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Historique</span>
            {conversationHistory.length > 1 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">{conversationHistory.length - 1}</span>
              </div>
            )}
          </Button>
        </div>
      </motion.header>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {showConversation ? (
            <ConversationPanel
              key="conversation"
              history={conversationHistory}
              userPreferences={userPreferences}
              onRefineSearch={handleRefineSearch}
              onClose={() => setShowConversation(false)}
            />
          ) : (
            <MovieDiscovery
              key="discovery"
              movies={movies}
              currentIndex={currentMovieIndex}
              onSwipe={handleSwipe}
              userPreferences={userPreferences}
              searchPrompt={searchData?.prompt}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
