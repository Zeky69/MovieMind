import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"

// --- Déplace uniquement les champs supportés dans metadata
export const metadata: Metadata = {
  title: "MovieMind - Trouvez le film parfait",
  description: "Une IA qui vous aide à choisir le film parfait selon votre envie",
  generator: "v0.dev"
}

// --- Déclare viewport séparément
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

// --- Déclare themeColor séparément
export const themeColor = "#667eea"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen relative">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
              <div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"
                style={{ animationDelay: "2s" }}
              ></div>
              <div
                className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow"
                style={{ animationDelay: "4s" }}
              ></div>
            </div>

            <Header />
            <main className="flex-1 relative z-10">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
