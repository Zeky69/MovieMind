"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Users, UserPlus, UserCheck, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useSuggestedUsers, useUserSearch } from "@/hooks/use-user"
import { UserService } from "@/services/user.service"
import type { User } from "@/types/user"
import { useToast } from "@/hooks/use-toast"

export default function DiscoverPage() {
  const { user: currentUser, isAuthenticated } = useAuth()
  const { suggestions, loading: suggestionsLoading } = useSuggestedUsers(20)
  const { users: searchResults, loading: searchLoading, searchUsers, clearSearch } = useUserSearch()
  const [searchQuery, setSearchQuery] = useState("")
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { toast } = useToast()

  // Rediriger si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Effectuer la recherche quand la query change
  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery)
    } else {
      clearSearch()
    }
  }, [searchQuery, searchUsers, clearSearch])

  const handleFollowToggle = async (targetUser: User) => {
    if (!currentUser) return

    try {
      setFollowingUsers(prev => new Set([...prev, targetUser._id]))

      // Vérifier d'abord si on suit l'utilisateur
      const followStatus = await UserService.isFollowingUser(targetUser._id)
      
      if (followStatus.is_following) {
        await UserService.unfollowUser(targetUser._id)
        toast({
          title: "Désabonnement",
          description: `Vous ne suivez plus @${targetUser.username}`,
        })
      } else {
        await UserService.followUser(targetUser._id)
        toast({
          title: "Nouvel abonnement ! 🎉",
          description: `Vous suivez maintenant @${targetUser.username}`,
        })
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le suivi",
        variant: "destructive",
      })
    } finally {
      setFollowingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(targetUser._id)
        return newSet
      })
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Vous devez être connecté pour voir cette page</p>
          <Button onClick={() => router.push("/login")}>Se connecter</Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            Découvrir des cinéphiles
          </h1>
          <p className="text-gray-400">Trouvez des personnes qui partagent vos goûts cinématographiques</p>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom d'utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white rounded-2xl"
            />
          </div>
        </motion.div>

        {/* Users Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          {(suggestionsLoading || searchLoading) ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          ) : (searchQuery.trim() ? searchResults : suggestions?.suggestions || []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(searchQuery.trim() ? searchResults : suggestions?.suggestions || []).map((user, index) => {
                const isFollowingUser = followingUsers.has(user._id)

                return (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass border-white/10 hover:border-purple-400/30 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <img
                              src={user.avatar_url || "/placeholder.svg?height=60&width=60"}
                              alt={user.username}
                              className="w-15 h-15 rounded-full object-cover border-2 border-purple-400/30"
                            />
                            {/* Badge de suivi (on peut le supprimer ou utiliser les stats) */}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-white truncate">
                                {user.first_name && user.last_name 
                                  ? `${user.first_name} ${user.last_name}`
                                  : `@${user.username}`
                                }
                              </h3>
                              <span className="text-sm text-gray-400">@{user.username}</span>
                            </div>

                            {user.bio && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{user.bio}</p>}

                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                              <span>Membre depuis {formatDate(user.created_at)}</span>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => router.push(`/profile/${user._id}`)}
                                variant="outline"
                                size="sm"
                                className="flex-1 border-white/20 text-gray-300 hover:text-white"
                              >
                                Voir profil
                              </Button>

                              <Button
                                onClick={() => handleFollowToggle(user)}
                                disabled={isFollowingUser}
                                size="sm"
                                className="gradient-primary text-white"
                              >
                                {isFollowingUser ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                  <UserPlus className="w-4 h-4 mr-2" />
                                )}
                                {isFollowingUser ? 'En cours...' : 'Suivre'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold text-white mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-400">
                {searchQuery ? "Essayez avec d'autres mots-clés" : "Il n'y a pas d'autres utilisateurs pour le moment"}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
