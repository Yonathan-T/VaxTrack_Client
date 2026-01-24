"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getProfile } from "./auth-api"
import { apiClient } from "./api-client"

export type UserRole = "healthcare_worker" | "health_official" | "admin" | "parent" | "super_admin" | "system_administrator" | "woreda_officer"

export interface User {
  id?: string
  email: string
  name: string
  role: UserRole
  phone?: string
  facility?: string
  facility_id?: string | number | null
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
        if (token) {
          const { data, error } = await getProfile()
          if (!error && data) {
            setUser(data as User)
          } else {
            // Clear invalid token
            apiClient.clearToken()
            setUser(null)
          }
        }
      } catch (err) {
        console.error("User verification failed:", err)
        // Clear any invalid token on error
        apiClient.clearToken()
        setUser(null)
      }
      setIsLoading(false)
    }

    verifyUser()
  }, [])

  const logout = () => {
    setUser(null)
    apiClient.clearToken() // call apiClient.clearToken() instead of manually clearing localStorage
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  return <UserContext.Provider value={{ user, setUser, logout, hasRole, isLoading }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within UserProvider")
  }
  return context
}
