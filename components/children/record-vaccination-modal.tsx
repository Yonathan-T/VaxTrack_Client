"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useState } from "react"
import { useVaccinations } from "@/lib/vaccinations-context"

interface RecordVaccinationModalProps {
  isOpen: boolean
  onClose: () => void
  childId: string
}

export function RecordVaccinationModal({ isOpen, onClose, childId }: RecordVaccinationModalProps) {
  const { language } = useLanguage()
  const { addVaccination } = useVaccinations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    vaccine: "",
    dateAdministered: "",
    batchNumber: "",
    facility: "",
    administeredBy: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.vaccine ||
      !formData.dateAdministered ||
      !formData.batchNumber ||
      !formData.facility ||
      !formData.administeredBy
    ) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      addVaccination({
        childId,
        vaccine: formData.vaccine,
        date: formData.dateAdministered,
        batchNumber: formData.batchNumber,
        facility: formData.facility,
        administeredBy: formData.administeredBy,
        status: "completed",
        nextDue: "To be determined",
      })

      // Reset form
      setFormData({
        vaccine: "",
        dateAdministered: "",
        batchNumber: "",
        facility: "",
        administeredBy: "",
      })

      setIsSubmitting(false)
      onClose()
    } catch (error) {
      console.error("Error recording vaccination:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("vaccinations.recordVaccination", language)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("form.selectVaccine", language)}</Label>
              <Select value={formData.vaccine} onValueChange={(value) => setFormData({ ...formData, vaccine: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectVaccine", language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BCG">BCG</SelectItem>
                  <SelectItem value="Penta 1">Penta 1</SelectItem>
                  <SelectItem value="Penta 2">Penta 2</SelectItem>
                  <SelectItem value="OPV 1">OPV 1</SelectItem>
                  <SelectItem value="OPV 2">OPV 2</SelectItem>
                  <SelectItem value="PCV 1">PCV 1</SelectItem>
                  <SelectItem value="PCV 2">PCV 2</SelectItem>
                  <SelectItem value="Rotavirus 1">Rotavirus 1</SelectItem>
                  <SelectItem value="Rotavirus 2">Rotavirus 2</SelectItem>
                  <SelectItem value="Measles">Measles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("vaccinations.dateAdministered", language)}</Label>
              <Input
                type="date"
                value={formData.dateAdministered}
                onChange={(e) => setFormData({ ...formData, dateAdministered: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t("vaccinations.batchNumber", language)}</Label>
              <Input
                placeholder="e.g., PENTA-2024-089"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t("form.selectFacility", language)}</Label>
              <Select
                value={formData.facility}
                onValueChange={(value) => setFormData({ ...formData, facility: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectFacility", language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Addis Ketema Health Center">Addis Ketema Health Center</SelectItem>
                  <SelectItem value="Kebele 05 Clinic">Kebele 05 Clinic</SelectItem>
                  <SelectItem value="Woreda 03 Center">Woreda 03 Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>{t("vaccinations.administeredBy", language)}</Label>
            <Input
              placeholder="Nurse name"
              value={formData.administeredBy}
              onChange={(e) => setFormData({ ...formData, administeredBy: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("form.cancel", language)}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("form.recording", language) : t("form.submit", language)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
