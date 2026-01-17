"use client"

import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"

interface RoleProtectedProps {
  children: ReactNode
  allowedRoles: string[]
}

export function RoleProtected({ children, allowedRoles }: RoleProtectedProps) {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const { language } = useLanguage()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{language === "am" ? "ጠብቆ ይስሉ..." : "Loading..."}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="p-6 border-red-200 bg-red-50/50">
        <div className="flex items-center gap-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">
              {language === "am" ? "ዘወትር ግብዓት" : "Authentication Required"}
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {language === "am" ? "ይህ ገጽ ለመድረስ ውስጥ መግባት ያስፈልግዎታል" : "You must be logged in to access this page"}
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              {language === "am" ? "ግብዓት" : "Go to Login"}
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Card className="p-6 border-red-200 bg-red-50/50">
        <div className="flex items-center gap-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">{language === "am" ? "ፍቃድ ተገደበ" : "Access Denied"}</h3>
            <p className="text-sm text-red-700 mt-1">
              {language === "am" ? "ይህ ገጽ ለእርስዎ ሚና ሊደረስ አይችልም" : "This page is not available for your role"}
            </p>
            <Link
              href="/dashboard"
              className="mt-3 inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              {language === "am" ? "ተመለስ" : "Go to Dashboard"}
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  return children
}
