"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Loader } from "@/components/loader"
import { MovieDiscovery } from "@/components/movie-discovery"
import { ConversationPanel } from "@/components/conversation-panel"
import type { Movie } from "@/types/movie"
import type { SwipeAction } from "@/types/chat"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"

export default function ChatPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [chatData, setChatData] = useState<any>(null)
  const [showConversation, setShowConversation] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<string[]>([])
  const [userPreferences, setUserPreferences] = useState({
    liked: [] as Movie[],
    disliked: [] as Movie[],
    loved: [] as Movie[],
  })
  const { user: currentUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const chatId = params.id as string

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const initializeChat = async () => {
      if (!chatId) {
        router.push("/")
        return
      }

      try {
        setIsLoading(true)
        
        // Récupérer les données du chat et les films recommandés avec l'ID
        const data = await api.get<{
          id: string
          prompt: string
          isGroupMode: boolean
          movies: Movie[]
          conversation_history?: string[]
        }>(`/chat/${chatId}`)
        
        setChatData(data)
        setMovies(data.movies || [])
        
        // Initialiser l'historique de conversation
        const initialHistory = data.conversation_history || [`Recherche initiale: "${data.prompt}"`]
        setConversationHistory(initialHistory)
        
      } catch (error) {
        console.error("Erreur lors de l'initialisation du chat:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    initializeChat()
  }, [chatId, router])

  const handleSwipe = async (action: SwipeAction, movie: Movie) => {
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

    const newHistory = [...conversationHistory, actionText[action]]
    setConversationHistory(newHistory)

    // Envoyer l'action au serveur pour mettre à jour le chat
    try {
      await api.post(`/chat/${chatId}/action`, {
        action,
        movie_id: movie.id,
        movie_title: movie.title
      })
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'action:", error)
    }

    // Passer au film suivant
    if (currentMovieIndex < movies.length - 1) {
      setCurrentMovieIndex((prev) => prev + 1)
    } else {
      // Fin des films, proposer d'affiner
      setShowConversation(true)
    }
  }

  const handleMovieSelected = async (movie: Movie) => {
    const selectedMessage = `🎯 Film sélectionné: "${movie.title}"`
    setConversationHistory((prev) => [...prev, selectedMessage])
    
    // Envoyer la sélection au serveur
    try {
      await api.post(`/chat/${chatId}/select`, {
        movie_id: movie.id,
        movie_title: movie.title
      })
    } catch (error) {
      console.error("Erreur lors de la sélection du film:", error)
    }
    
    // Ici on pourrait ouvrir une modal avec les liens de streaming
  }

  const handleRefineSearch = async (refinement: string) => {
    const refinementMessage = `🔍 Affinement: "${refinement}"`
    setConversationHistory((prev) => [...prev, refinementMessage])
    setShowConversation(false)
    setIsLoading(true)

    try {
      // Envoyer l'affinement au serveur pour obtenir de nouveaux films
      const response = await api.post<{ movies: Movie[] }>(`/chat/${chatId}/refine`, {
        refinement,
        user_preferences: userPreferences
      })
      
      setMovies(response.movies)
      setCurrentMovieIndex(0)
    } catch (error) {
      console.error("Erreur lors de l'affinement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!chatData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Chat introuvable</h2>
          <Button onClick={() => router.push("/")} variant="outline">
            Retour à l'accueil
          </Button>
        </div>
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
              searchPrompt={chatData?.prompt}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
