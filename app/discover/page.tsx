"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Users, UserPlus, UserCheck, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getAllUsers, followUser, unfollowUser } from "@/lib/auth"
import type { User } from "@/types/user"
import { useToast } from "@/hooks/use-toast"

export default function DiscoverPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const current = getCurrentUser()
    if (!current) {
      router.push("/login")
      return
    }

    setCurrentUser(current)
    const users = getAllUsers().filter((u) => u.id !== current.id)
    setAllUsers(users)
    setFilteredUsers(users)
  }, [router])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.bio?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(allUsers)
    }
  }, [searchQuery, allUsers])

  const handleFollowToggle = (targetUser: User) => {
    if (!currentUser) return

    const isFollowing = currentUser.following.includes(targetUser.id)

    if (isFollowing) {
      unfollowUser(currentUser.id, targetUser.id)
      toast({
        title: "Désabonnement",
        description: `Vous ne suivez plus @${targetUser.username}`,
      })
    } else {
      followUser(currentUser.id, targetUser.id)
      toast({
        title: "Nouvel abonnement ! 🎉",
        description: `Vous suivez maintenant @${targetUser.username}`,
      })
    }

    // Mettre à jour l'utilisateur actuel
    const updatedCurrentUser = getCurrentUser()
    if (updatedCurrentUser) {
      setCurrentUser(updatedCurrentUser)
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
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
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUsers.map((user, index) => {
                const isFollowing = currentUser.following.includes(user.id)
                const mutualFollowers = user.followers.filter((id) => currentUser.following.includes(id))

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass border-white/10 hover:border-purple-400/30 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <img
                              src={user.avatar || "/placeholder.svg?height=60&width=60"}
                              alt={user.username}
                              className="w-15 h-15 rounded-full object-cover border-2 border-purple-400/30"
                            />
                            {isFollowing && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                <Heart className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-white truncate">@{user.username}</h3>
                              {mutualFollowers.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {mutualFollowers.length} ami{mutualFollowers.length > 1 ? "s" : ""} commun
                                  {mutualFollowers.length > 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>

                            {user.bio && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{user.bio}</p>}

                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                              <span>{user.followers.length} abonnés</span>
                              <span>{user.likedMovies.length} films aimés</span>
                              <span>Depuis {formatDate(user.createdAt)}</span>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => router.push(`/profile/${user.id}`)}
                                variant="outline"
                                size="sm"
                                className="flex-1 border-white/20 text-gray-300 hover:text-white"
                              >
                                Voir profil
                              </Button>

                              <Button
                                onClick={() => handleFollowToggle(user)}
                                size="sm"
                                className={`flex items-center gap-2 ${
                                  isFollowing
                                    ? "bg-green-500/20 hover:bg-red-500/20 text-green-300 hover:text-red-300 border border-green-500/30 hover:border-red-500/30"
                                    : "gradient-primary text-white"
                                }`}
                              >
                                {isFollowing ? (
                                  <>
                                    <UserCheck className="w-4 h-4" />
                                    Suivi
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-4 h-4" />
                                    Suivre
                                  </>
                                )}
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
