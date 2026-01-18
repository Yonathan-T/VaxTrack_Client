"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { apiClient } from "@/lib/api-client"
import { registerUser, googleOAuthRedirect } from "@/lib/auth-api"
import type { UserRole } from "@/lib/user-context"

export function RegisterForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { setUser } = useUser()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError(language === "am" ? "ይለፍ ቃሎች አይዛመዱም" : "Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        name: formData.fullName,
        phone: formData.phoneNumber,
        role: "parent",
      }

      console.log("Registering as Parent:", payload)

      const { data, error: apiError } = await registerUser(payload)

      if (apiError) {
        setError(apiError.message || (language === "am" ? "ሂሳብ በመፍጠር ላይ ስህተት ተከስቷል" : "Registration failed"))
        setLoading(false)
        return
      }

      if (data?.user) {
        if ((data as any).token) {
          apiClient.setToken((data as any).token)
        }

        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as UserRole,
        })
        router.push("/dashboard")
      } else {
        setError(language === "am" ? "ሂሳብ በመፍጠር ላይ ስህተት ተከስቷል" : "Invalid registration response")
      }
    } catch (err) {
      console.error("[v0] Registration exception:", err)
      setError(language === "am" ? "ሂሳብ በመፍጠር ላይ ስህተት ተከስቷል" : "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-semibold">
            {language === "am" ? "ሙሉ ስም" : "Full Name"}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="fullName"
              placeholder={language === "am" ? "ሙሉ ስምዎን ያስገቡ" : "Enter your full name"}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="pl-10 h-10 bg-input border-border focus:border-primary transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold">
            {language === "am" ? "ኢሜይል" : "Email"}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder={language === "am" ? "ኢሜይልዎን ያስገቡ" : "parent@gmail.com"}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10 h-10 bg-input border-border focus:border-primary transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-semibold">
            {language === "am" ? "ስልክ ቁጥር" : "Phone Number"}
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="phoneNumber"
              type="tel"
              placeholder={language === "am" ? "ስልክ ቁጥርዎን ያስገቡ" : "Enter your phone number"}
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="pl-10 h-10 bg-input border-border focus:border-primary transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold">
            {language === "am" ? "ይለፍ ቃል" : "Password"}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={language === "am" ? "ይለፍ ቃል ይፍጠሩ" : "Create a password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 pr-10 h-10 bg-input border-border focus:border-primary transition-colors"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold">
            {language === "am" ? "ይለፍ ቃል ያረጋግጡ" : "Confirm Password"}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={language === "am" ? "ይለፍ ቃልዎን ያረጋግጡ" : "Confirm your password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="pl-10 pr-10 h-10 bg-input border-border focus:border-primary transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-10 font-semibold mt-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              {language === "am" ? "ሂሳብ በመፍጠር ላይ..." : "Creating account..."}
            </div>
          ) : language === "am" ? (
            "ሂሳብ ይፍጠሩ"
          ) : (
            "Create account"
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
          className="w-full h-10"
          onClick={googleOAuthRedirect}
        >
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
          Google
        </Button>
      </form>
    </div>
  )
}
