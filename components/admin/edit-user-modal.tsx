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
import type { User, Facility } from "@/lib/admin-api"
import { getFacilities, getSubCities, type SubCity } from "@/lib/admin-api"
import { useUser } from "@/lib/user-context"

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onUserSaved: (user: User) => void
}

export function EditUserModal({ isOpen, onClose, user, onUserSaved }: EditUserModalProps) {
  const { language } = useLanguage()
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "health_official", // Default to health_official for super admin
    facility_id: null as string | number | null,
    sub_city_id: null as string | number | null,
    status: "active" as "active" | "inactive" | "pending",
  })
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [subCities, setSubCities] = useState<SubCity[]>([])

  // Check if current user is super admin (super_admin role OR admin role with no facility)
  const isSuperAdmin = currentUser?.role === "super_admin" || (currentUser?.role === "admin" && !currentUser?.facility_id)
  // Check if current user is local admin (admin role with a facility)
  const isLocalAdmin = currentUser?.role === "admin" && currentUser?.facility_id

  // Debug logging to check user detection
  // console.log("[EditUserModal] User detection:", {
  //   currentUserRole: currentUser?.role,
  //   currentUserFacilityId: currentUser?.facility_id,
  //   currentUserIsGlobal: currentUser?.is_global,
  //   currentUserIsLocal: currentUser?.is_local,
  //   isSuperAdmin,
  //   isLocalAdmin
  // })

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isSuperAdmin) {
          // Load sub-cities for super admin
          const res = await getSubCities()
          const payload: any = res.data
          const scArray = Array.isArray(payload?.data) ? payload.data : []
          setSubCities(scArray as SubCity[])
        } else if (isLocalAdmin) {
          // Load only the local admin's facility
          setFacilities([{
            id: currentUser?.facility_id,
            name: currentUser?.facility || "Current Facility"
          } as Facility])
        } else {
          // Load facilities for other admins
          const res = await getFacilities()
          const payload: any = res.data
          const fArray =
            (Array.isArray(payload?.facilities) && payload.facilities) ||
            (Array.isArray(payload?.data) && payload.data) ||
            []
          setFacilities(fArray as Facility[])
        }
      } catch (e) {
        // ignore silently; dropdown will be empty
      }
    }
    if (isOpen) loadData()
  }, [isOpen, isSuperAdmin, isLocalAdmin, currentUser])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        facility_id: (user as any).facility_id ?? null,
        sub_city_id: (user as any).sub_city_id ?? null,
        status: user.status,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        role: isSuperAdmin ? "health_official" : isLocalAdmin ? "healthcare_worker" : "healthcare_worker",
        facility_id: isLocalAdmin ? (currentUser?.facility_id || null) : null,
        sub_city_id: null,
        status: "active",
      })
    }
  }, [user, isOpen, isSuperAdmin, isLocalAdmin, currentUser])

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

      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        facility_id: isSuperAdmin ? null : (isLocalAdmin ? currentUser?.facility_id : formData.facility_id),
        sub_city_id: isSuperAdmin ? formData.sub_city_id : null,
      }

      const { data, error } = await (method === "POST"
        ? apiClient.post<{ user: User }>(endpoint, payload)
        : apiClient.put<{ user: User }>(endpoint, payload))

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
                  {isSuperAdmin ? (
                    // Super admin can only create Health Officials
                    <SelectItem value="health_official">
                      {language === "am" ? "ጤና ኃላፊ" : "Health Official"}
                    </SelectItem>
                  ) : isLocalAdmin ? (
                    // Local admin can create Healthcare Workers and Parents only
                    <>
                      <SelectItem value="healthcare_worker">
                        {language === "am" ? "ጤና ሰራተኛ" : "Healthcare Worker"}
                      </SelectItem>
                      <SelectItem value="parent">
                        {language === "am" ? "ወላጅ" : "Parent"}
                      </SelectItem>
                    </>
                  ) : (
                    // Other admins can create various roles
                    <>
                      <SelectItem value="healthcare_worker">
                        {language === "am" ? "ጤና ሰራተኛ" : "Healthcare Worker"}
                      </SelectItem>
                      <SelectItem value="woreda_officer">{language === "am" ? "ወረዳ ኦፊሰር" : "Woreda Officer"}</SelectItem>
                      <SelectItem value="administrator">{language === "am" ? "አስተዳዳሪ" : "Administrator"}</SelectItem>
                      <SelectItem value="data_clerk">{language === "am" ? "ውሂብ ተከላካይ" : "Data Clerk"}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            {isSuperAdmin && (
              <div>
                <Label htmlFor="sub_city_id">{language === "am" ? "ንዑስ ከተማ" : "Sub City"}</Label>
                <Select
                  value={formData.sub_city_id != null ? String(formData.sub_city_id) : ""}
                  onValueChange={(value) => setFormData({ ...formData, sub_city_id: value === "" ? null : value })}
                >
                  <SelectTrigger id="sub_city_id">
                    <SelectValue placeholder={language === "am" ? "ንዑስ ከተማ ይምረጡ" : "Select sub city"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{language === "am" ? "አንዳችም" : "None"}</SelectItem>
                    {subCities.map((sc) => (
                      <SelectItem key={String((sc as any).id)} value={String((sc as any).id)}>
                        {sc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {!isSuperAdmin && !isLocalAdmin && (
              <div>
                <Label htmlFor="facility_id">{language === "am" ? "ጤና ተቋም" : "Facility"}</Label>
                <Select
                  value={formData.facility_id != null ? String(formData.facility_id) : ""}
                  onValueChange={(value) => setFormData({ ...formData, facility_id: value === "" ? null : value })}
                >
                  <SelectTrigger id="facility_id">
                    <SelectValue placeholder={language === "am" ? "ተቋም ይምረጡ" : "Select facility (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{language === "am" ? "አንዳችም" : "None (Super Admin)"}</SelectItem>
                    {facilities.map((f) => (
                      <SelectItem key={String((f as any).id)} value={String((f as any).id)}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
