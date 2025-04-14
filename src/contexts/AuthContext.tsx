"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

interface User {
  id: number
  email: string
  name: string
}

interface AuthContextType {
  currentUser: User | null
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string, name: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from localStorage
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      if (user) {
        setCurrentUser(JSON.parse(user))
      }
      setLoading(false)
    }
  }, [])

  // Mock user database
  const users = [{ id: 1, email: "admin@example.com", password: "password123", name: "Admin User" }]

  function login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find((user) => user.email === email && user.password === password)

        if (user) {
          const userInfo = { id: user.id, email: user.email, name: user.name }
          localStorage.setItem("user", JSON.stringify(userInfo))
          setCurrentUser(userInfo)
          resolve(userInfo)
        } else {
          reject(new Error("Invalid email or password"))
        }
      }, 1000)
    })
  }

  function register(email: string, password: string, name: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (users.some((user) => user.email === email)) {
          reject(new Error("Email already in use"))
          return
        }

        const newUser = { id: users.length + 1, email, password, name }
        users.push(newUser)

        const userInfo = { id: newUser.id, email: newUser.email, name: newUser.name }
        localStorage.setItem("user", JSON.stringify(userInfo))
        setCurrentUser(userInfo)
        resolve(userInfo)
      }, 1000)
    })
  }

  function logout() {
    localStorage.removeItem("user")
    setCurrentUser(null)
    toast.success("Logged out successfully")
    router.push("/login")
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
