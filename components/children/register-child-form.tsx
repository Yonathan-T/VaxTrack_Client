"use client"

import { useState, FormEvent } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from 'lucide-react'
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { registerNewChild } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"

export function RegisterChildForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { toast } = useToast()
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

  const handleSubmit = async (e: FormEvent) => {
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
      const response = await registerNewChild({
        name: `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}`.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        guardianName: `${formData.guardianFirstName} ${formData.guardianLastName}`.trim(),
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
      })

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
    } catch (err) {
      setError(t("form.registrationFailed", language))
      console.error("[RegisterChildForm] Registration error:", err)
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
        <h3 className="text-lg font-semibold text-foreground">Child Information</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              value={formData.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
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
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthWeight">Birth Weight (kg)</Label>
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
          <Label htmlFor="placeOfBirth">Place of Birth</Label>
          <Input
            id="placeOfBirth"
            value={formData.placeOfBirth}
            onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Guardian Information</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guardianFirstName">Guardian First Name *</Label>
            <Input
              id="guardianFirstName"
              value={formData.guardianFirstName}
              onChange={(e) => setFormData({ ...formData, guardianFirstName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianLastName">Guardian Last Name *</Label>
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
            <Label htmlFor="relationship">Relationship to Child *</Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) => setFormData({ ...formData, relationship: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mother">Mother</SelectItem>
                <SelectItem value="father">Father</SelectItem>
                <SelectItem value="grandmother">Grandmother</SelectItem>
                <SelectItem value="grandfather">Grandfather</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianPhone">Guardian Phone Number *</Label>
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
              Guardian Email (Optional)
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
        <h3 className="text-lg font-semibold text-foreground">Address Information</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="kebele">Kebele *</Label>
            <Input
              id="kebele"
              value={formData.kebele}
              onChange={(e) => setFormData({ ...formData, kebele: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="woreda">Woreda *</Label>
            <Input
              id="woreda"
              value={formData.woreda}
              onChange={(e) => setFormData({ ...formData, woreda: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="houseNumber">House Number</Label>
            <Input
              id="houseNumber"
              value={formData.houseNumber}
              onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes about the child..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="min-w-[140px]">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Registering...
            </>
          ) : (
            "Register Child"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
