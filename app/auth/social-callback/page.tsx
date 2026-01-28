"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { apiClient } from "@/lib/api-client"

export default function SocialCallbackPage() {
  const router = useRouter()
  const { setUser } = useUser()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get("token")

        if (!token) {
          setError("No token received from OAuth provider")
          setLoading(false)
          return
        }

        // Set the token in the API client
        apiClient.setToken(token)

        // Fetch user profile using the token
        const response = await apiClient.get("/v1/user")
        
        if (response.data) {
          const userData = response.data as any
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            phone: userData.phone,
            facility: userData.facility,
            facility_id: userData.facility_id,
            is_local: userData.is_local,
            is_global: userData.is_global,
            avatar: userData.avatar,
          })
          
          // Redirect to dashboard
          router.push("/dashboard")
        } else {
          setError("Failed to fetch user profile")
        }
      } catch (err) {
        console.error("OAuth callback error:", err)
        setError("Authentication failed")
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [router, setUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return null
}
