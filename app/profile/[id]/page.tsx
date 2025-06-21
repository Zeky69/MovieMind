"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Zap, Users, Calendar, UserPlus, UserMinus } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useUserProfile, useFollow, useFollowStats } from "@/hooks/use-user"
import { UserService } from "@/services/user.service"
import { mockMovies } from "@/data/mock-movies"
import { MovieCard } from "@/components/movie-card"
import type { User } from "@/types/user"
import { useToast } from "@/hooks/use-toast"

export default function UserProfilePage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const userId = parseInt(params.id as string, 10)
  
  // Get profile user data
  const { user: profileUser, loading: profileLoading, error: profileError } = useUserProfile(userId)
  
  // Get follow stats for the profile user
  const { stats: followStats, loading: statsLoading } = useFollowStats(userId)
  
  // Get follow status and management for current user towards profile user
  const { isFollowing, loading: followLoading, toggleFollow } = useFollow(userId)
  
  // State for followers and following lists
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [connectionsLoading, setConnectionsLoading] = useState(false)

  // Fetch followers and following lists
  useEffect(() => {
    const fetchConnections = async () => {
      if (!userId) return
      
      try {
        setConnectionsLoading(true)
        const [followersData, followingData] = await Promise.all([
          UserService.getUserFollowers(userId),
          UserService.getUserFollowing(userId)
        ])
        setFollowers(followersData)
        setFollowing(followingData)
      } catch (error) {
        console.error('Error fetching connections:', error)
      } finally {
        setConnectionsLoading(false)
      }
    }

    if (userId && profileUser) {
      fetchConnections()
    }
  }, [userId, profileUser])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login")
    }
  }, [authLoading, currentUser, router])

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser || followLoading) return

    try {
      await toggleFollow()
      toast({
        title: isFollowing ? "Désabonnement" : "Nouvel abonnement ! 🎉",
        description: isFollowing 
          ? `Vous ne suivez plus @${profileUser.username}`
          : `Vous suivez maintenant @${profileUser.username}`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération",
        variant: "destructive"
      })
    }
  }

  const isLoading = authLoading || profileLoading || statsLoading

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

  if (!currentUser) {
    return null // Will redirect to login
  }

  if (profileError || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Profil introuvable</p>
          <Button onClick={() => router.push("/profile")}>Retour</Button>
        </div>
      </div>
    )
  }

  // Mock movie lists - In real app, this would come from backend
  const likedMovies = mockMovies.filter((movie) => Math.random() > 0.7) // Mock data
  const lovedMovies = mockMovies.filter((movie) => Math.random() > 0.8) // Mock data

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
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
                src={profileUser.avatar_url || "/placeholder.svg?height=120&width=120"}
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
                  <div className="text-2xl font-bold text-purple-400">{followStats?.followers_count || 0}</div>
                  <div className="text-gray-400">Abonnés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{followStats?.following_count || 0}</div>
                  <div className="text-gray-400">Abonnements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{likedMovies.length}</div>
                  <div className="text-gray-400">Films aimés</div>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                Membre depuis {formatDate(profileUser.created_at)}
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
                  {followStats?.following_count || 0}
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
                    Abonnements ({followStats?.following_count || 0})
                  </h3>

                  {connectionsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-400">Chargement...</p>
                    </div>
                  ) : following && following.length > 0 ? (
                    <div className="space-y-4">
                      {following.map((friend: User) => (
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
                    Abonnés ({followStats?.followers_count || 0})
                  </h3>

                  {connectionsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-400">Chargement...</p>
                    </div>
                  ) : followers && followers.length > 0 ? (
                    <div className="space-y-4">
                      {followers.map((follower: User) => (
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
