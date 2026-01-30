"use client"

import { useState, FormEvent } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, UserPlus } from 'lucide-react'
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { registerNewChild } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"
import { RegisterParentModal } from "./register-parent-modal"

export function RegisterChildForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    placeOfBirth: "",
    birthWeight: "",
    relationship: "",
    guardianPhone: "",
    guardianEmail: "",
    address: "",
    kebele: "",
    woreda: "",
    houseNumber: "",
  })

  const handleParentRegistered = (parentPhone: string) => {
    // Update the guardian phone field with the newly registered parent's phone
    setFormData({ ...formData, guardianPhone: parentPhone })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.dateOfBirth ||
      !formData.gender ||
      !formData.relationship ||
      !formData.address ||
      !formData.kebele ||
      !formData.woreda
    ) {
      setError(t("form.fillRequiredFields", language))
      setLoading(false)
      return
    }

    // Validate that at least one of guardian phone or email is provided
    if (!formData.guardianPhone && !formData.guardianEmail) {
      setError(t("form.provideContactInfo", language))
      setLoading(false)
      return
    }

    try {
      const rel = (formData.relationship || "").trim()
      const relationshipValue =
        rel === "Mother" ? "mother" :
        rel === "Father" ? "father" :
        rel === "Grandmother" ? "Grandmother" :
        rel === "Grandfather" ? "Grandfather" :
        "other"
      const payload: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        sex: (formData.gender || "").toLowerCase().trim(),
        relationship_to_child: relationshipValue,
        address: formData.address,
        kebele: formData.kebele,
        woreda: formData.woreda,
      }

      // Only include parent fields if they are provided
      if (formData.guardianPhone) payload.parent_phone = formData.guardianPhone
      if (formData.guardianEmail) payload.parent_email = formData.guardianEmail

      if (formData.placeOfBirth) payload.place_of_birth = formData.placeOfBirth
      if (formData.houseNumber) payload.house_number = formData.houseNumber

      // Debug: log payload being sent
      try {
        console.groupCollapsed("[RegisterChildForm] registerNewChild payload")
        console.log(JSON.stringify(payload, null, 2))
        console.groupEnd()
      } catch {}

      const response = await registerNewChild(payload)

      // Debug: log raw API response envelope
      try {
        console.groupCollapsed("[RegisterChildForm] registerNewChild response")
        console.log("status:", response.status)
        console.log("data:", response.data)
        console.log("error:", response.error)
        console.groupEnd()
      } catch {}

      if (response.error) {
        setError(response.error.message || t("form.registrationFailed", language))
        setLoading(false)
        return
      }

      toast({
        title: t("form.success" as any, language) || "Success",
        description: t("form.childRegisteredSuccessfully" as any, language) || "Child registered successfully",
      })

      setError("")
      router.push("/dashboard/children")
    } catch (err: any) {
      // Debug: log caught error thoroughly
      // eslint-disable-next-line no-console
      console.error("[RegisterChildForm] Registration error:", err?.response || err)
      const serverMessage = err?.response?.data?.message || err?.message
      setError(serverMessage || t("form.registrationFailed", language))
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("form.childInformation", language)}</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t("form.firstName", language)} *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">{t("form.lastName", language)} *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">{t("form.dateOfBirth", language)} *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">{t("form.gender", language)} *</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectGender", language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("form.male", language)}</SelectItem>
                <SelectItem value="female">{t("form.female", language)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthWeight">{t("form.birthWeight", language)}</Label>
            <Input
              id="birthWeight"
              type="number"
              step="0.1"
              value={formData.birthWeight}
              onChange={(e) => setFormData({ ...formData, birthWeight: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="placeOfBirth">{t("form.placeOfBirth", language)}</Label>
          <Input
            id="placeOfBirth"
            value={formData.placeOfBirth}
            onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("form.guardianInformation", language)}</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="relationship">{t("form.selectRelationship", language)} *</Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) => setFormData({ ...formData, relationship: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectRelationship", language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mother">{t("form.mother", language)}</SelectItem>
                <SelectItem value="Father">{t("form.father", language)}</SelectItem>
                <SelectItem value="Grandmother">{t("form.grandmother", language)}</SelectItem>
                <SelectItem value="Grandfather">{t("form.grandfather", language)}</SelectItem>
                <SelectItem value="Brother">Brother</SelectItem>
                <SelectItem value="Guardian">{t("form.other", language)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianPhone">{t("form.guardianPhone", language)}</Label>
            <div className="flex gap-2">
              <Input
                id="guardianPhone"
                type="tel"
                placeholder="+251911234567"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                className="flex-1"
              />
              <RegisterParentModal onParentRegistered={handleParentRegistered}>
                <Button type="button" variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t("form.newParent", language)}
                </Button>
              </RegisterParentModal>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("form.guardianPhoneHint", language)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianEmail">
              {t("form.guardianEmail", language)}
            </Label>
            <Input
              id="guardianEmail"
              type="email"
              value={formData.guardianEmail}
              onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
              placeholder="parent@example.com"
            />
            <p className="text-xs text-muted-foreground">
              {t("form.guardianEmailHint", language)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("form.addressInformation", language)}</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="kebele">{t("form.kebele", language)} *</Label>
            <Input
              id="kebele"
              value={formData.kebele}
              onChange={(e) => setFormData({ ...formData, kebele: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="woreda">{t("form.woreda", language)} *</Label>
            <Input
              id="woreda"
              value={formData.woreda}
              onChange={(e) => setFormData({ ...formData, woreda: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="houseNumber">{t("form.houseNumber", language)}</Label>
            <Input
              id="houseNumber"
              value={formData.houseNumber}
              onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="min-w-[140px]">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("form.registering", language)}...
            </>
          ) : (
            t("form.registerChild", language)
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("common.cancel", language)}
        </Button>
      </div>
    </form>
  )
}
