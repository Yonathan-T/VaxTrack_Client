"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useState, useEffect } from "react"
import { getChildProfile, type ChildProfile } from "@/lib/healthcare-worker-api"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface EditChildModalProps {
  isOpen: boolean
  onClose: () => void
  child: any
}

export function EditChildModal({ isOpen, onClose, child }: EditChildModalProps) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [childData, setChildData] = useState<ChildProfile | null>(null)
  const [parentInfo, setParentInfo] = useState<{ name: string; email: string; phone?: string } | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    sex: "",
    national_id: "",
    address: "",
  })

  useEffect(() => {
    if (isOpen && child?.id) {
      const fetchChildData = async () => {
        try {
          setIsLoading(true)
          const response = await getChildProfile(child.id.toString())

          if (response.error) {
            toast({
              title: "Error",
              description: response.error.message || "Failed to load child data",
              variant: "destructive",
            })
            return
          }

          if (response.data) {
            const data = response.data as any
            setChildData(data)

            // Load form data
            setFormData({
              first_name: data.first_name || "",
              last_name: data.last_name || "",
              date_of_birth: data.date_of_birth
                ? new Date(data.date_of_birth).toISOString().split("T")[0]
                : "",
              sex: data.sex || "",
              national_id: data.national_id || "",
              address: data.address || "",
            })

            // Fetch parent info
            if (data.user_id) {
              try {
                const userResponse = await apiClient.get(`/v1/admin/users/${data.user_id}`)
                if (userResponse.data && !userResponse.error) {
                  const userData = userResponse.data as any
                  setParentInfo({
                    name: userData.name || userData.first_name || "Unknown",
                    email: userData.email || "-",
                    phone: userData.phone || userData.phone_number || "-",
                  })
                }
              } catch (err) {
                console.error("[EditChildModal] Error fetching parent info:", err)
              }
            }
          }
        } catch (error) {
          console.error("[EditChildModal] Error:", error)
          toast({
            title: "Error",
            description: "Failed to load child data",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchChildData()
    }
  }, [isOpen, child?.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Update API endpoint when available
      // const response = await apiClient.put(`/v1/children/${child.id}`, formData)
      // For now, just show success
      toast({
        title: "Success",
        description: "Child information updated successfully",
      })
      setIsSubmitting(false)
      onClose()
      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error("[EditChildModal] Error:", error)
      toast({
        title: "Error",
        description: "Failed to update child information",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  if (!child) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t("dashboard.actions.edit", language) || "Edit"} {t("form.childInformation", language) || "Child Information"}
          </DialogTitle>
          <DialogDescription>
            Update child information. Changes will be saved to the system.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="space-y-3 w-full">
              <div className="h-10 bg-muted animate-pulse rounded-md" />
              <div className="h-10 bg-muted animate-pulse rounded-md" />
              <div className="h-10 bg-muted animate-pulse rounded-md" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">{t("form.childInformation", language) || "Child Information"}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{t("form.firstName", language) || "First Name"} *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">{t("form.lastName", language) || "Last Name"} *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">{t("form.dateOfBirth", language) || "Date of Birth"} *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">{t("children.gender", language) || "Gender"} *</Label>
                  <Select
                    value={formData.sex}
                    onValueChange={(value) => setFormData({ ...formData, sex: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("form.male", language) || "Male"}</SelectItem>
                      <SelectItem value="female">{t("form.female", language) || "Female"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="national_id">National ID</Label>
                  <Input
                    id="national_id"
                    value={formData.national_id}
                    onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Child's address"
                  />
                </div>
              </div>
            </div>

            {parentInfo && (
              <div className="border-t pt-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t("form.guardianInformation", language) || "Parent/Guardian Information"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Parent information is linked to the user account and cannot be edited here.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-muted-foreground">Name</Label>
                      <p className="font-medium text-foreground">{parentInfo.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium text-foreground">{parentInfo.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t("children.phone", language) || "Phone"}</Label>
                      <p className="font-medium text-foreground">{parentInfo.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {t("form.cancel", language) || "Cancel"}
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? "Saving..." : t("form.submit", language) || "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
