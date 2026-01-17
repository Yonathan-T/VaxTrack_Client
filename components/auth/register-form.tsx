"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff, User, Mail, Lock, Building2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { apiClient } from "@/lib/api-client"
import { registerUser } from "@/lib/auth-api"
import type { UserRole } from "@/lib/user-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RegisterForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { setUser } = useUser()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "healthcare_worker",
    facility: "",
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
      const { data, error: apiError } = await registerUser({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        facility: formData.facility || undefined,
      })

      if (apiError) {
        setError(apiError.message || (language === "am" ? "ሂሳብ በመፍጠር ላይ ስህተት ተከስቷል" : "Registration failed"))
        setLoading(false)
        return
      }

      if (data?.user) {
        // Some backends return token on registration, some require separate login
        if ((data as any).token) {
          apiClient.setToken((data as any).token)
        }

        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as UserRole,
          facility: (data.user as any).facility || undefined,
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
            placeholder={language === "am" ? "ኢሜይልዎን ያስገቡ" : "healthcare@gmail.com"}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="pl-10 h-10 bg-input border-border focus:border-primary transition-colors"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-semibold">
          {language === "am" ? "ሚና" : "Role"}
        </Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger id="role" className="h-10 bg-input border-border focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="healthcare_worker">{language === "am" ? "ጤና ሰራተኛ" : "Healthcare Worker"}</SelectItem>
            <SelectItem value="woreda_officer">{language === "am" ? "ወረዳ ኦፊሰር" : "Woreda Officer"}</SelectItem>
            <SelectItem value="administrator">{language === "am" ? "አስተዳዳሪ" : "Administrator"}</SelectItem>
            <SelectItem value="guardian">{language === "am" ? "ጠበቃ" : "Guardian"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="facility" className="text-sm font-semibold">
          {language === "am" ? "ጤና ተቋም" : "Health Facility"}
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="facility"
            placeholder={language === "am" ? "ጤና ተቋምዎን ያስገቡ" : "Enter your health facility name"}
            value={formData.facility}
            onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
            className="pl-10 h-10 bg-input border-border focus:border-primary transition-colors"
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
        className="w-full h-10 font-semibold mt-6 bg-primary hover:bg-primary/90"
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
    </form>
  )
}
