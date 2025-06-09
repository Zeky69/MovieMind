"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-8xl font-bold text-slate-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-4">Page introuvable</h2>
          <p className="text-slate-400 text-lg mb-8">
            Oups ! Cette page semble avoir disparu dans les méandres du cinéma...
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/history" className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Voir l'historique
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12"
        >
          <p className="text-slate-500 text-sm">
            "Parfois, se perdre mène aux meilleures découvertes" - Un sage du cinéma
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
