"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ChatRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la page d'accueil si on accède directement à /chat
    router.push("/")
  }, [router])

  return null
}
