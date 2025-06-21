"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, X, Zap, Users, Calendar, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useMyProfile, useFollowStats, useUserConnections } from "@/hooks/use-user"
import { mockMovies } from "@/data/mock-movies"
import { MovieCard } from "@/components/movie-card"
import type { User } from "@/types/user"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const { user: profileUser, loading, error } = useMyProfile()
  const { stats } = useFollowStats(user?.id || 0)
  const { users: followers } = useUserConnections(user?.id || 0, 'followers')
  const { users: following } = useUserConnections(user?.id || 0, 'following')
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Erreur lors du chargement du profil</p>
          <Button onClick={() => router.push("/login")}>Se connecter</Button>
        </div>
      </div>
    )
  }

  // Pour l'instant, on utilise des données factices pour les films
  // Ces données devront être récupérées depuis le backend plus tard
  const likedMovies = mockMovies.slice(0, 3) // Films aimés factices
  const dislikedMovies = mockMovies.slice(3, 5) // Films non aimés factices
  const lovedMovies = mockMovies.slice(0, 2) // Films adorés factices
  const watchlistMovies = mockMovies.slice(5, 8) // Watchlist factice

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={() => router.push("/")} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <Button onClick={() => router.push("/profile/edit")} variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Modifier le profil
          </Button>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={user.avatar_url || "/placeholder.svg?height=120&width=120"}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-400/30"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900"></div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : `@${user.username}`
                }
              </h1>
              <p className="text-gray-400 mb-2">@{user.username}</p>
              {user.bio && <p className="text-gray-300 mb-4">{user.bio}</p>}

              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {stats?.followers_count || 0}
                  </div>
                  <div className="text-gray-400">Abonnés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {stats?.following_count || 0}
                  </div>
                  <div className="text-gray-400">Abonnements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{likedMovies.length}</div>
                  <div className="text-gray-400">Films aimés</div>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                Membre depuis {formatDate(user.created_at)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Tabs defaultValue="liked" className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass mb-8">
              <TabsTrigger value="liked" className="flex items-center gap-2 data-[state=active]:bg-green-600">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Aimés</span>
                <Badge variant="secondary" className="ml-1">
                  {likedMovies.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="loved" className="flex items-center gap-2 data-[state=active]:bg-yellow-600">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Coups de ❤️</span>
                <Badge variant="secondary" className="ml-1">
                  {lovedMovies.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="disliked" className="flex items-center gap-2 data-[state=active]:bg-red-600">
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Rejetés</span>
                <Badge variant="secondary" className="ml-1">
                  {dislikedMovies.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Amis</span>
                <Badge variant="secondary" className="ml-1">
                  {following.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="liked" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Films que j'aime</h2>
                <p className="text-gray-400">Vos films préférés que vous recommanderiez</p>
              </div>

              {likedMovies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {likedMovies.map((movie, index) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <MovieCard movie={movie} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Aucun film aimé pour le moment</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="loved" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Mes coups de cœur</h2>
                <p className="text-gray-400">Les films qui vous ont marqué</p>
              </div>

              {lovedMovies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lovedMovies.map((movie, index) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="relative">
                        <MovieCard movie={movie} />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Aucun coup de cœur pour le moment</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="disliked" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Films rejetés</h2>
                <p className="text-gray-400">Les films qui ne vous ont pas plu</p>
              </div>

              {dislikedMovies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dislikedMovies.map((movie, index) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="relative opacity-60">
                        <MovieCard movie={movie} />
                        <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <X className="w-8 h-8 text-red-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <X className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Aucun film rejeté</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="friends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Following */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Abonnements ({following.length})
                  </h3>

                  {following.length > 0 ? (
                    <div className="space-y-4">
                      {following.map((friend) => (
                        <Card key={friend.id} className="glass border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={friend.avatar_url || "/placeholder.svg?height=50&width=50"}
                                alt={friend.username}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">@{friend.username}</h4>
                                {friend.bio && <p className="text-sm text-gray-400 line-clamp-1">{friend.bio}</p>}
                              </div>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-purple-400/30 text-purple-300"
                              >
                                <Link href={`/profile/${friend.id}`}>Voir profil</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Vous ne suivez personne encore</p>
                      <Button asChild className="mt-4" variant="outline">
                        <Link href="/discover">Découvrir des utilisateurs</Link>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Followers */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Abonnés ({followers.length})
                  </h3>

                  {followers.length > 0 ? (
                    <div className="space-y-4">
                      {followers.map((follower) => (
                        <Card key={follower.id} className="glass border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={follower.avatar_url || "/placeholder.svg?height=50&width=50"}
                                alt={follower.username}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">@{follower.username}</h4>
                                {follower.bio && <p className="text-sm text-gray-400 line-clamp-1">{follower.bio}</p>}
                              </div>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-purple-400/30 text-purple-300"
                              >
                                <Link href={`/profile/${follower.id}`}>Voir profil</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Personne ne vous suit encore</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}
