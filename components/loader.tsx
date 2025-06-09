"use client"

import { motion } from "framer-motion"
import { Film } from "lucide-react"

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="mb-4"
      >
        <Film className="w-12 h-12 text-blue-400" />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center">
        <h3 className="text-lg font-semibold mb-2">Recherche en cours...</h3>
        <p className="text-slate-400">Notre IA analyse vos goûts pour vous proposer les meilleurs films</p>
      </motion.div>

      <motion.div
        className="flex gap-1 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-400 rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
