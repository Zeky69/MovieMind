"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Film, History, Home, Menu, X, User, LogOut, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"

export function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user: currentUser, isAuthenticated, logout: handleLogout, loading } = useAuth()

  return (
    <>
      <motion.header
        className="glass border-b border-white/10 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Film className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg group-hover:bg-purple-300/30 transition-all duration-300"></div>
              </div>
              <span className="text-xl sm:text-2xl font-bold gradient-text hidden sm:block">MovieMind</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Button
                asChild
                variant={pathname === "/" ? "default" : "ghost"}
                className={`rounded-xl transition-all duration-300 ${
                  pathname === "/"
                    ? "gradient-primary text-white shadow-glow"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Accueil
                </Link>
              </Button>

              {isAuthenticated ? (
                <>
                  <Button
                    asChild
                    variant={pathname.startsWith("/profile") ? "default" : "ghost"}
                    className={`rounded-xl transition-all duration-300 ${
                      pathname.startsWith("/profile")
                        ? "gradient-primary text-white shadow-glow"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Link href="/profile" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {currentUser?.avatar_url ? (
                          <img
                            src={currentUser.avatar_url || "/placeholder.svg"}
                            alt={currentUser.username}
                            className="w-5 h-5 rounded-full object-cover border border-purple-400/30"
                          />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span className="hidden lg:inline">@{currentUser?.username}</span>
                        <span className="lg:hidden">Profil</span>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant={pathname === "/discover" ? "default" : "ghost"}
                    className={`rounded-xl transition-all duration-300 ${
                      pathname === "/discover"
                        ? "gradient-primary text-white shadow-glow"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Link href="/discover" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Découvrir
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant={pathname === "/history" ? "default" : "ghost"}
                    className={`rounded-xl transition-all duration-300 ${
                      pathname === "/history"
                        ? "gradient-primary text-white shadow-glow"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Link href="/history" className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Historique
                    </Link>
                  </Button>

                  <Button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                      window.location.href = "/"
                    }}
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button asChild className="gradient-primary text-white rounded-xl">
                  <Link href="/login" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Connexion
                  </Link>
                </Button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden glass border-b border-white/10 sticky top-[73px] z-40"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Button
              asChild
              variant={pathname === "/" ? "default" : "ghost"}
              className={`w-full justify-start rounded-xl transition-all duration-300 ${
                pathname === "/" ? "gradient-primary text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Accueil
              </Link>
            </Button>
            {isAuthenticated ? (
              <>
                <Button
                  asChild
                  variant={pathname.startsWith("/profile") ? "default" : "ghost"}
                  className={`w-full justify-start rounded-xl transition-all duration-300 ${
                    pathname.startsWith("/profile")
                      ? "gradient-primary text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href="/profile" className="flex items-center gap-2">
                    {currentUser?.avatar_url ? (
                      <img
                        src={currentUser.avatar_url || "/placeholder.svg"}
                        alt={currentUser.username}
                        className="w-4 h-4 rounded-full object-cover border border-purple-400/30"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    @{currentUser?.username}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname === "/discover" ? "default" : "ghost"}
                  className={`w-full justify-start rounded-xl transition-all duration-300 ${
                    pathname === "/discover"
                      ? "gradient-primary text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href="/discover" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Découvrir
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname === "/history" ? "default" : "ghost"}
                  className={`w-full justify-start rounded-xl transition-all duration-300 ${
                    pathname === "/history"
                      ? "gradient-primary text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href="/history" className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Historique
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                    setIsMobileMenuOpen(false)
                    window.location.href = "/"
                  }}
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button
                asChild
                className="w-full justify-start gradient-primary text-white rounded-xl"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/login" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Connexion
                </Link>
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </>
  )
}
