"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, UserPlus } from 'lucide-react'
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { registerParent } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"

interface RegisterParentModalProps {
  onParentRegistered: (parentPhone: string) => void
  children: React.ReactNode
}

export function RegisterParentModal({ onParentRegistered, children }: RegisterParentModalProps) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTriggerClick = () => {
    console.log("New Parent button clicked!")
    setOpen(true)
  }

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.name || !formData.phone || !formData.password || !formData.passwordConfirmation) {
      setError(t("form.fillRequiredFields", language))
      setLoading(false)
      return
    }

    if (formData.password !== formData.passwordConfirmation) {
      setError(t("form.passwordsDoNotMatch", language))
      setLoading(false)
      return
    }

    try {
      const payload: any = {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.passwordConfirmation,
      }

      // Only include email if it's not empty
      if (formData.email && formData.email.trim() !== "") {
        payload.email = formData.email
      }

      const response = await registerParent(payload)

      if (response.error) {
        setError(response.error.message || t("form.registrationFailed", language))
        setLoading(false)
        return
      }

      toast({
        title: t("form.success" as any, language) || "Success",
        description: t("form.parentRegisteredSuccess", language),
      })

      // Pass the phone number back to the child form
      onParentRegistered(formData.phone)
      
      // Reset form and close modal
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        passwordConfirmation: "",
      })
      setOpen(false)
      setError("")
    } catch (err: any) {
      console.error("[RegisterParentModal] Registration error:", err)
      const serverMessage = err?.response?.data?.message || err?.message
      setError(serverMessage || t("form.registrationFailed", language))
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setOpen(false)
      setError("")
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        passwordConfirmation: "",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogTrigger asChild>
        <div onClick={handleTriggerClick}>
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("form.registerParentTitle", language)}</DialogTitle>
          <DialogDescription>
            {t("form.registerParentDescription", language)}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="parentName">{t("form.parentName", language)} *</Label>
            <Input
              id="parentName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter parent's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentPhone">{t("form.parentPhone", language)} *</Label>
            <Input
              id="parentPhone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+251911234567"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentEmail">{t("form.parentEmail", language)}</Label>
            <Input
              id="parentEmail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="parent@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentPassword">{t("form.password", language)} *</Label>
            <Input
              id="parentPassword"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentPasswordConfirmation">{t("form.confirmPassword", language)} *</Label>
            <Input
              id="parentPasswordConfirmation"
              type="password"
              value={formData.passwordConfirmation}
              onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
              placeholder="Confirm password"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("form.registeringParent", language)}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t("form.registerParent", language)}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
