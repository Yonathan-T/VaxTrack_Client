"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import type { User } from "@/lib/admin-api"

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onUserSaved: (user: User) => void
}

export function EditUserModal({ isOpen, onClose, user, onUserSaved }: EditUserModalProps) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "healthcare_worker",
    facility: "",
    status: "active" as "active" | "inactive" | "pending",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        facility: user.facility || "",
        status: user.status,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        role: "healthcare_worker",
        facility: "",
        status: "active",
      })
    }
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ስም እና ኢ-ሜይል ያስፈልግዎታል" : "Name and email are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const method = user ? "PUT" : "POST"
      const endpoint = user ? `/v1/admin/users/${user.id}` : "/v1/admin/users"

      const { data, error } = await (method === "POST"
        ? apiClient.post<{ user: User }>(endpoint, formData)
        : apiClient.put<{ user: User }>(endpoint, formData))

      if (error) {
        toast({
          title: language === "am" ? "ስህተት" : "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      if (data) {
        onUserSaved(data.user)
        toast({
          title: language === "am" ? "ተሳክቷል" : "Success",
          description: user
            ? language === "am"
              ? "ተጠቃሚ ታግ isWrapper ተሳክቷል"
              : "User updated successfully"
            : language === "am"
              ? "ተጠቃሚ ተፈጥሯል"
              : "User created successfully",
        })
      }
    } catch (err) {
      console.error("[v0] Error saving user:", err)
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ተጠቃሚን ለመያዝ ያልተሳካ" : "Failed to save user",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEdit = !!user

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (language === "am" ? "ተጠቃሚ ያርትዑ" : "Edit User") : language === "am" ? "አዲስ ተጠቃሚ" : "Add New User"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{language === "am" ? "ሙሉ ስም" : "Full Name"}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === "am" ? "ሙሉ ስም ያስገቡ" : "Enter full name"}
              />
            </div>
            <div>
              <Label htmlFor="email">{language === "am" ? "ኢ-ሜይል" : "Email"}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={language === "am" ? "ኢ-ሜይል ያስገቡ" : "Enter email"}
              />
            </div>
            <div>
              <Label htmlFor="role">{language === "am" ? "ሚና" : "Role"}</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthcare_worker">
                    {language === "am" ? "ጤና ሰራተኛ" : "Healthcare Worker"}
                  </SelectItem>
                  <SelectItem value="woreda_officer">{language === "am" ? "ወረዳ ኦፊሰር" : "Woreda Officer"}</SelectItem>
                  <SelectItem value="administrator">{language === "am" ? "አስተዳዳሪ" : "Administrator"}</SelectItem>
                  <SelectItem value="data_clerk">{language === "am" ? "ውሂብ ተከላካይ" : "Data Clerk"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="facility">{language === "am" ? "ጤና ተቋም" : "Facility"}</Label>
              <Input
                id="facility"
                value={formData.facility}
                onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                placeholder={language === "am" ? "ተቋም ያስገቡ" : "Enter facility"}
              />
            </div>
          </div>

          {isEdit && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">{language === "am" ? "ሁኔታ" : "Status"}</h3>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as "active" | "inactive" | "pending" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{language === "am" ? "ንቁ" : "Active"}</SelectItem>
                  <SelectItem value="inactive">{language === "am" ? "ሌላ ነገር" : "Inactive"}</SelectItem>
                  <SelectItem value="pending">{language === "am" ? "መጠበቅ ላይ" : "Pending"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {language === "am" ? "ይቅር" : "Cancel"}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (language === "am" ? "ይቀመጡ..." : "Saving...") : language === "am" ? "ያስቀምጡ" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
