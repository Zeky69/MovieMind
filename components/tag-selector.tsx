"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface TagSelectorProps {
  onTagSelect: (tag: string) => void
}

const tags = {
  emotions: [
    { text: "Je veux rire", emoji: "😂" },
    { text: "J'ai envie de pleurer", emoji: "😭" },
    { text: "Besoin d'adrénaline", emoji: "⚡" },
    { text: "Envie de réfléchir", emoji: "🤔" },
    { text: "Quelque chose de romantique", emoji: "💕" },
    { text: "Du suspense", emoji: "😱" },
  ],
  genres: [
    { text: "Comédie", emoji: "🎭" },
    { text: "Action", emoji: "💥" },
    { text: "Drame", emoji: "🎬" },
    { text: "Science-fiction", emoji: "🚀" },
    { text: "Horreur", emoji: "👻" },
    { text: "Animation", emoji: "🎨" },
  ],
  duration: [
    { text: "Film court", emoji: "⏱️" },
    { text: "Durée normale", emoji: "🕐" },
    { text: "Film long", emoji: "⏰" },
    { text: "Série", emoji: "📺" },
  ],
  mood: [
    { text: "Quelque chose de léger", emoji: "☁️" },
    { text: "Film culte", emoji: "⭐" },
    { text: "Récent", emoji: "🆕" },
    { text: "Classique", emoji: "🏛️" },
  ],
}

export function TagSelector({ onTagSelect }: TagSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    { key: "emotions", label: "Émotions", icon: "💭" },
    { key: "genres", label: "Genres", icon: "🎪" },
    { key: "duration", label: "Durée", icon: "⏳" },
    { key: "mood", label: "Ambiance", icon: "🌟" },
  ]

  return (
    <div className="space-y-6">
      <motion.h3
        className="text-lg font-semibold text-center text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Ou choisissez rapidement :
      </motion.h3>

      {/* Category Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category, index) => (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant={selectedCategory === category.key ? "default" : "outline"}
              onClick={() => setSelectedCategory(selectedCategory === category.key ? null : category.key)}
              className={`btn-modern rounded-2xl px-4 py-2 transition-all duration-300 ${
                selectedCategory === category.key
                  ? "gradient-primary text-white shadow-glow"
                  : "glass text-gray-300 hover:text-white border-white/20 hover:border-purple-400/50"
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Tags */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex flex-wrap justify-center gap-2">
            {tags[selectedCategory as keyof typeof tags].map((tag, index) => (
              <motion.div
                key={tag.text}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onTagSelect(tag.text)
                    setSelectedCategory(null)
                  }}
                  className="btn-modern glass rounded-xl text-sm hover:shadow-glow-cyan transition-all duration-300 text-gray-300 hover:text-white border border-white/10 hover:border-cyan-400/50"
                >
                  <span className="mr-2">{tag.emoji}</span>
                  {tag.text}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
