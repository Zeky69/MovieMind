'use client'

import { useUserProfile, useFollow, useFollowStats } from '@/hooks/use-user'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Users, UserPlus, UserMinus } from 'lucide-react'

interface UserProfileCardProps {
  userId: number
}

export function UserProfileCard({ userId }: UserProfileCardProps) {
  const { user: currentUser } = useAuth()
  const { user, loading, error, refetch } = useUserProfile(userId)
  const { isFollowing, toggleFollow, loading: followLoading } = useFollow(userId)
  const { stats } = useFollowStats(userId)

  if (loading) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="p-6">
          <div className="text-red-400 text-center">
            <p>Erreur: {error}</p>
            <Button onClick={refetch} variant="outline" className="mt-2">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="p-6">
          <p className="text-center text-gray-400">Utilisateur non trouvé</p>
        </CardContent>
      </Card>
    )
  }

  const isOwnProfile = currentUser?.id === userId

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-white text-xl">
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user.username
              }
            </CardTitle>
            <p className="text-gray-400">@{user.username}</p>
            <p className="text-sm text-gray-500">
              Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {user.bio && (
          <p className="text-gray-300 mb-4">{user.bio}</p>
        )}
        
        {/* Statistiques */}
        {stats && (
          <div className="flex gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1 text-gray-400">
              <Users className="w-4 h-4" />
              <span>{stats.followers_count} followers</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Users className="w-4 h-4" />
              <span>{stats.following_count} suivis</span>
            </div>
          </div>
        )}
        
        {/* Bouton suivre/ne plus suivre */}
        {!isOwnProfile && (
          <div className="flex gap-2">
            <Button 
              onClick={toggleFollow}
              disabled={followLoading}
              variant={isFollowing ? "outline" : "default"}
              className={`${
                isFollowing 
                  ? "border-red-400 text-red-400 hover:bg-red-400/10" 
                  : "gradient-primary text-white"
              }`}
            >
              {followLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : isFollowing ? (
                <UserMinus className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isFollowing ? 'Ne plus suivre' : 'Suivre'}
            </Button>
          </div>
        )}
        
        {isOwnProfile && (
          <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10">
            Modifier le profil
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
