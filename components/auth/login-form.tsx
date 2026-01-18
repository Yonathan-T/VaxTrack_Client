"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { apiClient } from "@/lib/api-client"
import { loginUser, googleOAuthRedirect } from "@/lib/auth-api"
import type { UserRole } from "@/lib/user-context"

export function LoginForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { setUser } = useUser()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error: apiError } = await loginUser({ email, password })

      console.log("[v0] Login response data:", data)
      console.log("[v0] Login response error:", apiError)

      if (apiError) {
        setError(apiError.message || (language === "am" ? "የኢሜይል ወይም የይለፍ ቃል ስህተት" : "Invalid email or password"))
        setLoading(false)
        return
      }

      if (data?.token && data?.user) {
        apiClient.setToken(data.token)
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as UserRole,
          facility: data.user.facility,
        })
        router.push("/dashboard")
      } else {
        console.log("[v0] Invalid response structure. Expected token and user, got:", data)
        setError("Invalid login response")
      }
    } catch (err) {
      console.error("Login exception:", err)
      setError(language === "am" ? "በመግባት ላይ ስህተት ተከስቷል" : "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2.5">
        <Label htmlFor="email" className="text-sm font-semibold text-foreground">
          {language === "am" ? "ኢሜይል" : "Email"}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder={language === "am" ? "ጤና.ሰራተኛ@example.com" : "healthcare.worker@example.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-11 bg-input border-border focus:border-primary transition-colors"
            required
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-semibold text-foreground">
            {language === "am" ? "ይለፍ ቃል" : "Password"}
          </Label>
          <a href="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            {language === "am" ? "ይለፍ ቃል ረስተዋል?" : "Forgot password?"}
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={language === "am" ? "ይለፍ ቃልዎን ያስገቡ" : "Enter your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-11 bg-input border-border focus:border-primary transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full h-11 font-semibold text-base mt-6" disabled={loading}>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            {language === "am" ? "በመግባት ላይ..." : "Signing in..."}
          </div>
        ) : language === "am" ? (
          "ግባ"
        ) : (
          "Sign in"
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{language === "am" ? "ወይም ይቀጥሉ" : "Or continue with"}</span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full h-11"
        onClick={googleOAuthRedirect}
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
        Google
      </Button>
    </form>
  )
}
