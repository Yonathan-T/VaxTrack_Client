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
import { administerVaccine, getChildProfile } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/user-context"
import { Card } from "@/components/ui/card"
import { Calendar, Syringe, Building2 } from "lucide-react"

interface RecordVaccinationModalProps {
  isOpen: boolean
  onClose: () => void
  childId: string
  vaccinationRecord?: any
}

export function RecordVaccinationModal({
  isOpen,
  onClose,
  childId,
  vaccinationRecord,
}: RecordVaccinationModalProps) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [childData, setChildData] = useState<any>(null)
  const [formData, setFormData] = useState({
    vaccineId: "",
    vaccineName: "",
    dateAdministered: "",
    batchNumber: "",
  })

  useEffect(() => {
    if (isOpen && childId) {
      const fetchChildData = async () => {
        const response = await getChildProfile(childId)
        if (response.data) {
          setChildData(response.data as any)
        }
      }
      fetchChildData()
    }
  }, [isOpen, childId])

  useEffect(() => {
    if (vaccinationRecord && isOpen) {
      // Pre-fill form with vaccination record data
      setFormData({
        vaccineId: vaccinationRecord.vaccine_id?.toString() || vaccinationRecord.vaccine?.id?.toString() || "",
        vaccineName: vaccinationRecord.vaccine?.name || "",
        dateAdministered: new Date().toISOString().split("T")[0], // Today's date
        batchNumber: "",
      })
    } else if (isOpen) {
      // Reset form when opening without a specific record
      setFormData({
        vaccineId: "",
        vaccineName: "",
        dateAdministered: new Date().toISOString().split("T")[0],
        batchNumber: "",
      })
    }
  }, [vaccinationRecord, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.vaccineId || !formData.dateAdministered || !formData.batchNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Use the vaccination record ID if provided, otherwise we need to find it
      let vaccinationRecordId = vaccinationRecord?.id

      if (!vaccinationRecordId && childData?.vaccination_records) {
        // Find the matching vaccination record
        const matchingRecord = childData.vaccination_records.find(
          (r: any) => r.vaccine_id?.toString() === formData.vaccineId.toString(),
        )
        vaccinationRecordId = matchingRecord?.id
      }

      if (!vaccinationRecordId) {
        toast({
          title: "Error",
          description: "Could not find vaccination record. Please select a due vaccination first.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const response = await administerVaccine(vaccinationRecordId.toString(), {
        vaccineId: formData.vaccineId,
        batchNumber: formData.batchNumber,
        dateAdministered: formData.dateAdministered,
      })

      if (response.error) {
        toast({
          title: "Error",
          description: response.error.message || "Failed to record vaccination",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      toast({
        title: "Success",
        description: "Vaccination recorded successfully",
      })

      setIsSubmitting(false)
      onClose()
      // Refresh the page or trigger a refresh
      window.location.reload()
    } catch (error) {
      console.error("Error recording vaccination:", error)
      toast({
        title: "Error",
        description: "Failed to record vaccination",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const availableVaccines =
    childData?.vaccination_records
      ?.filter((r: any) => r.status === "scheduled" || r.status === "overdue")
      .map((r: any) => ({
        id: r.vaccine_id?.toString() || r.vaccine?.id?.toString() || "",
        name: r.vaccine?.name || "",
        code: r.vaccine?.code || "",
        scheduledDate: r.scheduled_date,
      })) || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Record Vaccination</DialogTitle>
          <DialogDescription>
            Record a vaccination administration for this child. All fields are required.
          </DialogDescription>
        </DialogHeader>

        {childData && (
          <Card className="p-4 bg-muted/50 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Syringe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {childData.first_name} {childData.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {childData.facility?.name || "Health Center"}
                </p>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccine">
                Select Vaccine *
              </Label>
              {vaccinationRecord ? (
                <Input
                  id="vaccine"
                  value={formData.vaccineName}
                  disabled
                  className="bg-muted"
                />
              ) : (
                <Select
                  value={formData.vaccineId}
                  onValueChange={(value) => {
                    const selected = availableVaccines.find((v: { id: string; name: string; code?: string }) => v.id === value)
                    setFormData({
                      ...formData,
                      vaccineId: value,
                      vaccineName: selected?.name || "",
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vaccine" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVaccines.length > 0 ? (
                      availableVaccines.map((vaccine: { id: string; name: string; code?: string }) => (
                        <SelectItem key={vaccine.id} value={vaccine.id}>
                          {vaccine.name} {vaccine.code && `(${vaccine.code})`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No vaccines available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              {!vaccinationRecord && availableVaccines.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  All vaccinations have been completed or no vaccines are scheduled.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateAdministered">
                Date Administered *
              </Label>
              <Input
                id="dateAdministered"
                type="date"
                value={formData.dateAdministered}
                onChange={(e) => setFormData({ ...formData, dateAdministered: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">
              Batch Number *
            </Label>
            <Input
              id="batchNumber"
              placeholder="e.g., PENTA-2024-089"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value.toUpperCase() })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the batch number from the vaccine vial
            </p>
          </div>

          <Card className="p-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Administered By
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.name || user?.email || "Current User"}
                </p>
              </div>
            </div>
            {childData?.facility && (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Facility</p>
                  <p className="text-sm text-muted-foreground">{childData.facility.name}</p>
                </div>
              </div>
            )}
          </Card>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.vaccineId || !formData.batchNumber}>
              {isSubmitting ? "Recording..." : "Record Vaccination"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
