'use client'

import { useSuggestedUsers } from '@/hooks/use-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, UserPlus, RefreshCw, Users } from 'lucide-react'
import { UserService } from '@/services/user.service'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export function SuggestedUsers() {
  const { suggestions, loading, error, refetch } = useSuggestedUsers(5)
  const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const handleFollow = async (userId: number) => {
    try {
      setFollowingUsers(prev => new Set([...prev, userId]))
      await UserService.followUser(userId)
      
      toast({
        title: "Utilisateur suivi !",
        description: "Vous suivez maintenant cet utilisateur",
      })
      
      // Refetch suggestions to get new ones
      refetch()
    } catch (error) {
      console.error('Error following user:', error)
      toast({
        title: "Erreur",
        description: "Impossible de suivre cet utilisateur",
        variant: "destructive",
      })
    } finally {
      setFollowingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-red-400 mb-3">Erreur: {error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!suggestions?.suggestions.length) {
    return (
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center">Aucune suggestion disponible</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Suggestions ({suggestions.total})
          </CardTitle>
          <Button 
            onClick={refetch} 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {suggestions.suggestions.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Link 
                href={`/profile/${user.id}`}
                className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user.username
                    }
                  </p>
                  <p className="text-gray-400 text-sm truncate">@{user.username}</p>
                </div>
              </Link>
              
              <Button
                onClick={() => handleFollow(user.id)}
                disabled={followingUsers.has(user.id)}
                size="sm"
                className="gradient-primary text-white ml-2"
              >
                {followingUsers.has(user.id) ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                ) : (
                  <UserPlus className="w-3 h-3 mr-1" />
                )}
                Suivre
              </Button>
            </div>
          ))}
        </div>
        
        {suggestions.total > suggestions.suggestions.length && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={refetch}>
              Voir plus de suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
