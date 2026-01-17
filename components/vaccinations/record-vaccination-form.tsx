"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useVaccinations } from "@/lib/vaccinations-context"
import { useChildren } from "@/lib/children-context"

const ethiopianVaccines = [
  { value: "bcg", label: "BCG", ageGroup: "At birth" },
  { value: "opv0", label: "OPV 0", ageGroup: "At birth" },
  { value: "penta1", label: "Penta 1", ageGroup: "6 weeks" },
  { value: "opv1", label: "OPV 1", ageGroup: "6 weeks" },
  { value: "pcv1", label: "PCV 1", ageGroup: "6 weeks" },
  { value: "rota1", label: "Rota 1", ageGroup: "6 weeks" },
  { value: "penta2", label: "Penta 2", ageGroup: "10 weeks" },
  { value: "opv2", label: "OPV 2", ageGroup: "10 weeks" },
  { value: "pcv2", label: "PCV 2", ageGroup: "10 weeks" },
  { value: "rota2", label: "Rota 2", ageGroup: "10 weeks" },
  { value: "penta3", label: "Penta 3", ageGroup: "14 weeks" },
  { value: "opv3", label: "OPV 3", ageGroup: "14 weeks" },
  { value: "pcv3", label: "PCV 3", ageGroup: "14 weeks" },
  { value: "ipv", label: "IPV", ageGroup: "14 weeks" },
  { value: "measles1", label: "Measles 1", ageGroup: "9 months" },
  { value: "measles2", label: "Measles 2", ageGroup: "15 months" },
]

export function RecordVaccinationForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { addVaccination } = useVaccinations()
  const { children } = useChildren()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchChild, setSearchChild] = useState("")
  const [selectedChild, setSelectedChild] = useState<any>(null)

  const [formData, setFormData] = useState({
    vaccine: "",
    dateAdministered: "",
    batchNumber: "",
    manufacturer: "",
    expiryDate: "",
    site: "",
    route: "",
    dose: "",
    adverseEvents: "",
    notes: "",
  })

  const handleChildSearch = () => {
    const found = children.find(
      (child) => child.name.toLowerCase().includes(searchChild.toLowerCase()) || child.id === searchChild,
    )
    if (found) {
      setSelectedChild(found)
    } else {
      setError("Child not found")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedChild) {
      setError("Please search and select a child first")
      return
    }

    if (!formData.vaccine || !formData.dateAdministered || !formData.batchNumber || !formData.expiryDate) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      addVaccination({
        childId: selectedChild.id,
        vaccine: formData.vaccine,
        date: formData.dateAdministered,
        batchNumber: formData.batchNumber,
        facility: formData.site || "Not specified",
        administeredBy: formData.administeredBy || "Not specified",
        status: "completed",
        nextDue: formData.notes || "To be determined",
      })

      setTimeout(() => {
        router.push("/dashboard/vaccinations")
      }, 1000)
    } catch (err) {
      setError("Failed to record vaccination")
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
        <h3 className="text-lg font-semibold text-foreground">{t("form.selectChild", language)}</h3>
        <div className="flex gap-2">
          <Input
            placeholder={t("form.searchByChildName", language)}
            value={searchChild}
            onChange={(e) => setSearchChild(e.target.value)}
          />
          <Button type="button" onClick={handleChildSearch}>
            <Search className="h-4 w-4 mr-2" />
            {t("form.search", language)}
          </Button>
        </div>

        {selectedChild && (
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{selectedChild.name}</p>
                <p className="text-sm text-muted-foreground">
                  DOB: {selectedChild.dateOfBirth} • Age: {selectedChild.age}
                </p>
                <p className="text-sm text-muted-foreground">Guardian: {selectedChild.guardian}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedChild(null)}>
                {t("form.change", language)}
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("form.vaccinationDetails", language)}</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vaccine">{t("form.selectVaccine", language)} *</Label>
            <Select value={formData.vaccine} onValueChange={(value) => setFormData({ ...formData, vaccine: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectVaccine", language)} />
              </SelectTrigger>
              <SelectContent>
                {ethiopianVaccines.map((vaccine) => (
                  <SelectItem key={vaccine.value} value={vaccine.value}>
                    {vaccine.label} ({vaccine.ageGroup})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateAdministered">{t("form.dateAdministered", language)} *</Label>
            <Input
              id="dateAdministered"
              type="date"
              value={formData.dateAdministered}
              onChange={(e) => setFormData({ ...formData, dateAdministered: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="batchNumber">Batch Number *</Label>
            <Input
              id="batchNumber"
              placeholder="e.g., BCG-2024-001"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              placeholder="Vaccine manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate">{t("form.expiryDate", language)} *</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dose">Dose (ml)</Label>
            <Input
              id="dose"
              type="number"
              step="0.1"
              placeholder="e.g., 0.5"
              value={formData.dose}
              onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="site">{t("form.selectSite", language)} *</Label>
            <Select value={formData.site} onValueChange={(value) => setFormData({ ...formData, site: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectSite", language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left_arm">Left Upper Arm</SelectItem>
                <SelectItem value="right_arm">Right Upper Arm</SelectItem>
                <SelectItem value="left_thigh">Left Thigh</SelectItem>
                <SelectItem value="right_thigh">Right Thigh</SelectItem>
                <SelectItem value="oral">Oral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="route">{t("form.selectRoute", language)} *</Label>
            <Select value={formData.route} onValueChange={(value) => setFormData({ ...formData, route: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectRoute", language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intramuscular">Intramuscular (IM)</SelectItem>
                <SelectItem value="subcutaneous">Subcutaneous (SC)</SelectItem>
                <SelectItem value="intradermal">Intradermal (ID)</SelectItem>
                <SelectItem value="oral">Oral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("form.additionalInformation", language)}</h3>

        <div className="space-y-2">
          <Label htmlFor="adverseEvents">Adverse Events</Label>
          <Textarea
            id="adverseEvents"
            placeholder="Document any adverse events or reactions..."
            value={formData.adverseEvents}
            onChange={(e) => setFormData({ ...formData, adverseEvents: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || !selectedChild}>
          {loading ? t("form.recording", language) : t("form.recordVaccination", language)}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("form.cancel", language)}
        </Button>
      </div>
    </form>
  )
}
