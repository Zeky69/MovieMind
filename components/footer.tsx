"use client"

import { motion } from "framer-motion"
import { ExternalLink, Heart, Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <motion.footer
      className="glass border-t border-white/10 mt-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Créé avec</span>
            <Heart className="w-4 h-4 text-red-400 animate-pulse" />
            <span>pour les cinéphiles</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors duration-300"
              >
                <span>Données TMDB</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <span className="text-sm text-gray-500">© 2024 MovieMind - Tous droits réservés</span>
        </div>
      </div>
    </motion.footer>
  )
}
