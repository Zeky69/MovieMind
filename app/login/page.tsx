"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Film, Mail, Lock, User, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { login, register, initializeUsers } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", confirmPassword: "" })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    initializeUsers()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = login(loginForm.email, loginForm.password)

      if (result.success) {
        toast({
          title: "Connexion réussie ! 🎬",
          description: `Bienvenue ${result.user?.username}`,
        })
        router.push("/")
      } else {
        toast({
          title: "Erreur de connexion",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = register(registerForm.username, registerForm.email, registerForm.password)

      if (result.success) {
        toast({
          title: "Compte créé ! 🎉",
          description: `Bienvenue ${result.user?.username}`,
        })
        router.push("/")
      } else {
        toast({
          title: "Erreur d'inscription",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>

            <div className="flex items-center justify-center gap-3 mb-4">
              <Film className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold gradient-text">MovieMind</h1>
            </div>
            <p className="text-gray-400">Connectez-vous pour sauvegarder vos préférences</p>
          </div>


          {/* Auth Forms */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-center text-white">Authentification</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 glass">
                  <TabsTrigger value="login" className="data-[state=active]:bg-purple-600">
                    Connexion
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-purple-600">
                    Inscription
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="pl-10 bg-white/5 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Mot de passe"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="pl-10 bg-white/5 border-white/20 text-white"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full gradient-primary text-white rounded-xl py-3"
                    >
                      {isLoading ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4 mt-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Nom d'utilisateur"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                          className="pl-10 bg-white/5 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="pl-10 bg-white/5 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Mot de passe"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className="pl-10 bg-white/5 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Confirmer le mot de passe"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          className="pl-10 bg-white/5 border-white/20 text-white"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full gradient-primary text-white rounded-xl py-3"
                    >
                      {isLoading ? "Inscription..." : "S'inscrire"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
