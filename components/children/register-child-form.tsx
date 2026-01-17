"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useChildren } from "@/lib/children-context"

export function RegisterChildForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { addChild } = useChildren()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    placeOfBirth: "",
    birthWeight: "",
    guardianFirstName: "",
    guardianLastName: "",
    relationship: "",
    guardianPhone: "",
    guardianEmail: "",
    kebele: "",
    woreda: "",
    houseNumber: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.dateOfBirth ||
      !formData.gender ||
      !formData.guardianFirstName ||
      !formData.guardianLastName ||
      !formData.relationship ||
      !formData.guardianPhone ||
      !formData.kebele ||
      !formData.woreda
    ) {
      setError(t("form.fillRequiredFields", language))
      setLoading(false)
      return
    }

    try {
      addChild(formData)
      setError("") // Clear error on success
      
      setTimeout(() => {
        router.push("/dashboard/children")
      }, 500)
    } catch (err) {
      setError(t("form.registrationFailed", language))
      console.error("[v0] Registration error:", err)
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
            <Label htmlFor="middleName">{t("form.middleName", language)}</Label>
            <Input
              id="middleName"
              value={formData.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
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
            <Label htmlFor="gender">{t("form.selectGender", language)} *</Label>
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

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guardianFirstName">{t("form.guardianFirstName", language)} *</Label>
            <Input
              id="guardianFirstName"
              value={formData.guardianFirstName}
              onChange={(e) => setFormData({ ...formData, guardianFirstName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianLastName">{t("form.guardianLastName", language)} *</Label>
            <Input
              id="guardianLastName"
              value={formData.guardianLastName}
              onChange={(e) => setFormData({ ...formData, guardianLastName: e.target.value })}
              required
            />
          </div>
        </div>

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
                <SelectItem value="mother">{t("form.mother", language)}</SelectItem>
                <SelectItem value="father">{t("form.father", language)}</SelectItem>
                <SelectItem value="grandmother">{t("form.grandmother", language)}</SelectItem>
                <SelectItem value="grandfather">{t("form.grandfather", language)}</SelectItem>
                <SelectItem value="other">{t("form.other", language)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianPhone">{t("form.guardianPhone", language)} *</Label>
            <Input
              id="guardianPhone"
              type="tel"
              placeholder="+251911234567"
              value={formData.guardianPhone}
              onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianEmail">
              {t("form.guardianEmail", language)} ({t("form.optional", language)})
            </Label>
            <Input
              id="guardianEmail"
              type="email"
              value={formData.guardianEmail}
              onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
            />
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
            <Label htmlFor="houseNumber">{t("form.houseNumber", language)}</Label>
            <Input
              id="houseNumber"
              value={formData.houseNumber}
              onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("form.additionalInformation", language)}</h3>

        <div className="space-y-2">
          <Label htmlFor="notes">{t("form.notes", language)}</Label>
          <Textarea
            id="notes"
            placeholder={t("form.additionalNotesPlaceholder", language)}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? t("form.registering", language) : t("form.registerChild", language)}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("form.cancel", language)}
        </Button>
      </div>
    </form>
  )
}
