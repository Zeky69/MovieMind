"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, Sparkles } from "lucide-react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  isLoading?: boolean
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Décrivez votre envie de film...",
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoading && value.trim()) {
      onSubmit(value.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative group">
        <div className="glass rounded-2xl p-1 transition-all duration-300 group-focus-within:shadow-glow">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="min-h-[120px] sm:min-h-[100px] resize-none bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-400 text-base sm:text-lg p-4 pr-16"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {!isLoading && value.trim() && (
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 rounded-full px-2 py-1">
                <Sparkles className="w-3 h-3" />
                Prêt
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading || !value.trim()}
              className="btn-modern gradient-primary rounded-xl w-10 h-10 p-0 shadow-glow hover:shadow-glow-pink transition-all duration-300"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Character count for mobile */}
        <div className="flex justify-between items-center mt-2 px-2 text-xs text-gray-500">
          <span>Appuyez sur Entrée pour envoyer</span>
          <span>{value.length}/500</span>
        </div>
      </div>
    </form>
  )
}
