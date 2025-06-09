import type { User } from "@/types/user"

// Simulation d'une base de données utilisateur
const USERS_KEY = "moviemind_users"
const CURRENT_USER_KEY = "moviemind_current_user"

// Utilisateurs de démonstration
const demoUsers: User[] = [
  {
    id: "demo1",
    username: "cinephile_alex",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Passionné de cinéma depuis toujours 🎬",
    createdAt: Date.now() - 86400000 * 30,
    followers: ["demo2", "demo3"],
    following: ["demo2"],
    likedMovies: ["1", "3", "5"],
    dislikedMovies: ["2"],
    lovedMovies: ["1"],
    watchlist: ["4", "6"],
  },
  {
    id: "demo2",
    username: "movie_sarah",
    email: "sarah@example.com",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Fan de films d'auteur et de blockbusters 🍿",
    createdAt: Date.now() - 86400000 * 60,
    followers: ["demo1"],
    following: ["demo1", "demo3"],
    likedMovies: ["2", "4", "6"],
    dislikedMovies: ["1"],
    lovedMovies: ["2", "4"],
    watchlist: ["7", "8"],
  },
  {
    id: "demo3",
    username: "film_lover_tom",
    email: "tom@example.com",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Critique amateur, toujours à la recherche de pépites 🎭",
    createdAt: Date.now() - 86400000 * 90,
    followers: ["demo1"],
    following: ["demo2"],
    likedMovies: ["3", "5", "7"],
    dislikedMovies: ["4"],
    lovedMovies: ["3"],
    watchlist: ["9", "10"],
  },
]

export function initializeUsers() {
  const stored = localStorage.getItem(USERS_KEY)
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers))
  }
}

export function getAllUsers(): User[] {
  const stored = localStorage.getItem(USERS_KEY)
  return stored ? JSON.parse(stored) : demoUsers
}

export function getUserById(id: string): User | null {
  const users = getAllUsers()
  return users.find((user) => user.id === id) || null
}

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem(CURRENT_USER_KEY)
  return stored ? JSON.parse(stored) : null
}

export function login(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = getAllUsers()
  const user = users.find((u) => u.email === email)

  if (!user) {
    return { success: false, error: "Utilisateur non trouvé" }
  }

  // Simulation de vérification de mot de passe (en production, utiliser un hash)
  if (password !== "password") {
    return { success: false, error: "Mot de passe incorrect" }
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  return { success: true, user }
}

export function register(
  username: string,
  email: string,
  password: string,
): { success: boolean; user?: User; error?: string } {
  const users = getAllUsers()

  if (users.find((u) => u.email === email)) {
    return { success: false, error: "Cet email est déjà utilisé" }
  }

  if (users.find((u) => u.username === username)) {
    return { success: false, error: "Ce nom d'utilisateur est déjà pris" }
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    username,
    email,
    createdAt: Date.now(),
    followers: [],
    following: [],
    likedMovies: [],
    dislikedMovies: [],
    lovedMovies: [],
    watchlist: [],
  }

  users.push(newUser)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))

  return { success: true, user: newUser }
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function updateUser(updatedUser: User) {
  const users = getAllUsers()
  const index = users.findIndex((u) => u.id === updatedUser.id)

  if (index !== -1) {
    users[index] = updatedUser
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser))
  }
}

export function followUser(currentUserId: string, targetUserId: string) {
  const users = getAllUsers()
  const currentUser = users.find((u) => u.id === currentUserId)
  const targetUser = users.find((u) => u.id === targetUserId)

  if (currentUser && targetUser) {
    if (!currentUser.following.includes(targetUserId)) {
      currentUser.following.push(targetUserId)
      targetUser.followers.push(currentUserId)

      localStorage.setItem(USERS_KEY, JSON.stringify(users))
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser))
    }
  }
}

export function unfollowUser(currentUserId: string, targetUserId: string) {
  const users = getAllUsers()
  const currentUser = users.find((u) => u.id === currentUserId)
  const targetUser = users.find((u) => u.id === targetUserId)

  if (currentUser && targetUser) {
    currentUser.following = currentUser.following.filter((id) => id !== targetUserId)
    targetUser.followers = targetUser.followers.filter((id) => id !== currentUserId)

    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser))
  }
}

export function addMovieToUserList(
  userId: string,
  movieId: string,
  listType: "liked" | "disliked" | "loved" | "watchlist",
) {
  const users = getAllUsers()
  const user = users.find((u) => u.id === userId)

  if (user) {
    const listKey = `${listType}Movies` as keyof User
    const currentList = user[listKey] as string[]

    if (!currentList.includes(movieId)) {
      // Retirer des autres listes si nécessaire
      if (listType === "liked") {
        user.dislikedMovies = user.dislikedMovies.filter((id) => id !== movieId)
      } else if (listType === "disliked") {
        user.likedMovies = user.likedMovies.filter((id) => id !== movieId)
        user.lovedMovies = user.lovedMovies.filter((id) => id !== movieId)
      } else if (listType === "loved") {
        user.dislikedMovies = user.dislikedMovies.filter((id) => id !== movieId)
        if (!user.likedMovies.includes(movieId)) {
          user.likedMovies.push(movieId)
        }
      }

      currentList.push(movieId)
      localStorage.setItem(USERS_KEY, JSON.stringify(users))

      if (getCurrentUser()?.id === userId) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
      }
    }
  }
}
