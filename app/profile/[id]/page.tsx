"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Zap, Users, Calendar, UserPlus, UserMinus } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { getCurrentUser, getUserById, followUser, unfollowUser, getAllUsers } from "@/lib/auth"
import { mockMovies } from "@/data/mock-movies"
import { MovieCard } from "@/components/movie-card"
import type { User } from "@/types/user"
import { useToast } from "@/hooks/use-toast"

export default function UserProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const current = getCurrentUser()
    if (!current) {
      router.push("/login")
      return
    }

    const userId = params.id as string
    const profile = getUserById(userId)

    if (!profile) {
      router.push("/profile")
      return
    }

    setCurrentUser(current)
    setProfileUser(profile)
    setIsFollowing(current.following.includes(userId))
    setIsLoading(false)
  }, [params.id, router])

  const handleFollowToggle = () => {
    if (!currentUser || !profileUser) return

    if (isFollowing) {
      unfollowUser(currentUser.id, profileUser.id)
      setIsFollowing(false)
      toast({
        title: "Désabonnement",
        description: `Vous ne suivez plus @${profileUser.username}`,
      })
    } else {
      followUser(currentUser.id, profileUser.id)
      setIsFollowing(true)
      toast({
        title: "Nouvel abonnement ! 🎉",
        description: `Vous suivez maintenant @${profileUser.username}`,
      })
    }

    // Mettre à jour l'utilisateur actuel
    const updatedCurrentUser = getCurrentUser()
    if (updatedCurrentUser) {
      setCurrentUser(updatedCurrentUser)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!profileUser || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Profil introuvable</p>
          <Button onClick={() => router.push("/profile")}>Retour</Button>
        </div>
      </div>
    )
  }

  const likedMovies = mockMovies.filter((movie) => profileUser.likedMovies.includes(movie.id))
  const lovedMovies = mockMovies.filter((movie) => profileUser.lovedMovies.includes(movie.id))
  const allUsers = getAllUsers()
  const followers = allUsers.filter((u) => profileUser.followers.includes(u.id))
  const following = allUsers.filter((u) => profileUser.following.includes(u.id))

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
    })
  }

  const isOwnProfile = currentUser.id === profileUser.id

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>

          {!isOwnProfile && (
            <Button
              onClick={handleFollowToggle}
              className={`flex items-center gap-2 ${
                isFollowing
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                  : "gradient-primary text-white"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4" />
                  Se désabonner
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Suivre
                </>
              )}
            </Button>
          )}
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
                src={profileUser.avatar || "/placeholder.svg?height=120&width=120"}
                alt={profileUser.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-400/30"
              />
              {isFollowing && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">@{profileUser.username}</h1>
              {profileUser.bio && <p className="text-gray-300 mb-4">{profileUser.bio}</p>}

              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{followers.length}</div>
                  <div className="text-gray-400">Abonnés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{following.length}</div>
                  <div className="text-gray-400">Abonnements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{likedMovies.length}</div>
                  <div className="text-gray-400">Films aimés</div>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                Membre depuis {formatDate(profileUser.createdAt)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Tabs defaultValue="liked" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass mb-8">
              <TabsTrigger value="liked" className="flex items-center gap-2 data-[state=active]:bg-green-600">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Films aimés</span>
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
                <h2 className="text-2xl font-bold text-white mb-2">
                  Films que {isOwnProfile ? "j'aime" : `@${profileUser.username} aime`}
                </h2>
                <p className="text-gray-400">
                  {isOwnProfile ? "Vos films préférés" : `Les films préférés de @${profileUser.username}`}
                </p>
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
                  <p className="text-gray-400">
                    {isOwnProfile ? "Aucun film aimé pour le moment" : "Aucun film aimé publiquement"}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="loved" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isOwnProfile ? "Mes coups de cœur" : `Coups de cœur de @${profileUser.username}`}
                </h2>
                <p className="text-gray-400">Les films qui ont marqué</p>
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
                  <p className="text-gray-400">Aucun coup de cœur partagé</p>
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
                                src={friend.avatar || "/placeholder.svg?height=50&width=50"}
                                alt={friend.username}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">@{friend.username}</h4>
                                {friend.bio && <p className="text-sm text-gray-400 line-clamp-1">{friend.bio}</p>}
                              </div>
                              <Button
                                onClick={() => router.push(`/profile/${friend.id}`)}
                                variant="outline"
                                size="sm"
                                className="border-purple-400/30 text-purple-300"
                              >
                                Voir profil
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">
                        {isOwnProfile ? "Vous ne suivez personne encore" : "Ne suit personne"}
                      </p>
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
                                src={follower.avatar || "/placeholder.svg?height=50&width=50"}
                                alt={follower.username}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">@{follower.username}</h4>
                                {follower.bio && <p className="text-sm text-gray-400 line-clamp-1">{follower.bio}</p>}
                              </div>
                              <Button
                                onClick={() => router.push(`/profile/${follower.id}`)}
                                variant="outline"
                                size="sm"
                                className="border-purple-400/30 text-purple-300"
                              >
                                Voir profil
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">{isOwnProfile ? "Personne ne vous suit encore" : "Aucun abonné"}</p>
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
