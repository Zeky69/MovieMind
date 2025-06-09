"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { MovieCard } from "@/components/movie-card"

interface HistoryItem {
  id: number
  prompt: string
  isGroupMode: boolean
  timestamp: number
  results: any[]
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("searchHistory")
    if (stored) {
      setHistory(JSON.parse(stored))
    }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem("searchHistory")
    setHistory([])
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const repeatSearch = (item: HistoryItem) => {
    localStorage.setItem(
      "currentSearch",
      JSON.stringify({
        prompt: item.prompt,
        isGroupMode: item.isGroupMode,
        timestamp: Date.now(),
      }),
    )
    router.push("/results")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={() => router.push("/")} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          {history.length > 0 && (
            <Button onClick={clearHistory} variant="destructive" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Vider l'historique
            </Button>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-8">Historique des recherches</h1>

        {history.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Clock className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 text-lg mb-4">Aucune recherche dans l'historique</p>
            <Button onClick={() => router.push("/")}>Faire une première recherche</Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">"{item.prompt}"</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(item.timestamp)}
                          </span>
                          {item.isGroupMode && (
                            <span className="px-2 py-1 bg-purple-600 text-xs rounded">Mode Groupe</span>
                          )}
                        </div>
                      </div>
                      <Button onClick={() => repeatSearch(item)} variant="outline" size="sm">
                        Relancer
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.results.slice(0, 3).map((movie) => (
                        <MovieCard key={movie.id} movie={movie} compact />
                      ))}
                    </div>
                    {item.results.length > 3 && (
                      <p className="text-sm text-slate-400 mt-4">+{item.results.length - 3} autres films</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
