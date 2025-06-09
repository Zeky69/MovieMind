"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChatInput } from "@/components/chat-input"
import { TagSelector } from "@/components/tag-selector"
import { Button } from "@/components/ui/button"
import { Dice6, Users, Sparkles, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [prompt, setPrompt] = useState("")
  const [isGroupMode, setIsGroupMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = async (searchPrompt: string) => {
    if (!searchPrompt.trim()) {
      toast({
        title: "Oops ! 🎬",
        description: "Décrivez-nous votre envie de film",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      localStorage.setItem(
        "currentSearch",
        JSON.stringify({
          prompt: searchPrompt,
          isGroupMode,
          timestamp: Date.now(),
        }),
      )

      router.push("/results")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRandomMovie = () => {
    const randomPrompts = [
      "Surprise-moi avec un film au hasard",
      "Je veux découvrir quelque chose de nouveau",
      "Choisis pour moi, j'ai confiance !",
      "Un film que je n'aurais jamais pensé à regarder",
    ]
    const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)]
    handleSearch(randomPrompt)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-8 sm:space-y-12"
        >
          {/* Hero Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-4">
                <span className="gradient-text">Movie</span>
                <span className="text-white">Mind</span>
              </h1>
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-pulse" />
              </div>
            </motion.div>

            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Décrivez votre envie, notre IA trouve le film parfait
            </motion.p>
          </div>

          {/* Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="glass rounded-2xl p-2 flex gap-2">
              <Button
                variant={!isGroupMode ? "default" : "ghost"}
                onClick={() => setIsGroupMode(false)}
                className={`rounded-xl px-6 py-3 transition-all duration-300 ${
                  !isGroupMode ? "gradient-primary text-white shadow-glow" : "text-gray-300 hover:text-white"
                }`}
              >
                <Zap className="w-4 h-4 mr-2" />
                Solo
              </Button>
              <Button
                variant={isGroupMode ? "default" : "ghost"}
                onClick={() => setIsGroupMode(true)}
                className={`rounded-xl px-6 py-3 transition-all duration-300 ${
                  isGroupMode ? "gradient-primary text-white shadow-glow" : "text-gray-300 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Groupe
              </Button>
            </div>
          </motion.div>

          {isGroupMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl p-4 max-w-md mx-auto"
            >
              <p className="text-sm text-gray-300">🎭 Mode groupe activé - Recommandations pour tous les goûts</p>
            </motion.div>
          )}

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <ChatInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleSearch}
              isLoading={isLoading}
              placeholder={
                isGroupMode
                  ? "Ex: On veut quelque chose qui plaira à tout le monde..."
                  : "Ex: J'ai envie de rire, quelque chose de léger..."
              }
            />
          </motion.div>

          {/* Quick Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <TagSelector onTagSelect={(tag) => setPrompt((prev) => prev + " " + tag)} />
          </motion.div>

          {/* Random Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <Button
              onClick={handleRandomMovie}
              disabled={isLoading}
              className="btn-modern glass rounded-2xl px-8 py-4 text-lg font-semibold hover:shadow-glow transition-all duration-300"
            >
              <Dice6 className="w-5 h-5 mr-2 animate-bounce-slow" />
              Roulette Magique
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
