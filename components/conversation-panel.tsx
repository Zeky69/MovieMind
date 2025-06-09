"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Send, Sparkles } from "lucide-react"
import type { Movie } from "@/types/movie"

interface ConversationPanelProps {
  history: string[]
  userPreferences: {
    liked: Movie[]
    disliked: Movie[]
    loved: Movie[]
  }
  onRefineSearch: (refinement: string) => void
  onClose: () => void
}

export function ConversationPanel({ history, userPreferences, onRefineSearch, onClose }: ConversationPanelProps) {
  const [refinementText, setRefinementText] = useState("")

  const handleSubmit = () => {
    if (refinementText.trim()) {
      onRefineSearch(refinementText.trim())
      setRefinementText("")
    }
  }

  const quickRefinements = [
    "Plus récent (après 2020)",
    "Moins violent",
    "Plus d'action",
    "Quelque chose de drôle",
    "Film français",
    "Série plutôt qu'un film",
    "Plus court (moins de 2h)",
    "Mieux noté (8+/10)",
  ]

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 glass backdrop-blur-xl z-50"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Affiner ma recherche</h2>
            <p className="text-sm text-gray-400">Dites-moi ce que vous cherchez exactement</p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Suggestions rapides */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Suggestions rapides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickRefinements.map((suggestion) => (
                <Button
                  key={suggestion}
                  onClick={() => onRefineSearch(suggestion)}
                  variant="outline"
                  className="glass border-white/20 text-gray-300 hover:text-white hover:border-purple-400/50 text-left justify-start"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Recherche personnalisée */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Recherche personnalisée</h3>
            <div className="space-y-4">
              <Textarea
                value={refinementText}
                onChange={(e) => setRefinementText(e.target.value)}
                placeholder="Ex: Je veux quelque chose de plus récent, avec moins de violence, plutôt une comédie romantique..."
                className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={handleSubmit}
                disabled={!refinementText.trim()}
                className="w-full gradient-primary text-white rounded-xl py-3"
              >
                <Send className="w-4 h-4 mr-2" />
                Affiner ma recherche
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
