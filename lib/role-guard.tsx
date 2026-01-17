"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useUser, type UserRole } from "@/lib/user-context"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackPath?: string
}

export function RoleGuard({ children, allowedRoles, fallbackPath = "/login" }: RoleGuardProps) {
  const { user, hasRole } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push(fallbackPath)
      return
    }

    if (!hasRole(allowedRoles)) {
      router.push("/dashboard")
      return
    }

    setIsChecking(false)
  }, [user, allowedRoles, hasRole, router, fallbackPath])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return <>{children}</>
}
