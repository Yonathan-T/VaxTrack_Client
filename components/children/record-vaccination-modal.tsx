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
import { useInventory } from "@/lib/inventory-context"
import { useUser } from "@/lib/user-context"
import { useVaccinations } from "@/lib/vaccinations-context"
import { Card } from "@/components/ui/card"
import { Calendar, Syringe, Building2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const { stock, isLoading: isInventoryLoading } = useInventory()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [childData, setChildData] = useState<any>(null)
  const [formData, setFormData] = useState({
    vaccineId: "",
    vaccineName: "",
    dateAdministered: "",
    batchNumber: "",
    doseMl: "",
    doseNumber: "",
  })
  const [isBatchPrefilled, setIsBatchPrefilled] = useState(false)

  // Compute available stock for the selected vaccine at this facility (by vaccine name)
  const availableQuantity = (() => {
    const name = (formData.vaccineName || "").trim().toLowerCase()
    if (!name) return 0
    return stock
      .filter((s) => (s.name || "").trim().toLowerCase() === name)
      .reduce((sum, s) => sum + (s.quantity || 0), 0)
  })()
  const noStock = !isInventoryLoading && Number(availableQuantity) <= 0

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
      // Prefer batch_number, then batchNumber, then nested lot if any
      const prefillBatchOpen =
        (vaccinationRecord as any)?.batch_number ||
        (vaccinationRecord as any)?.batchNumber ||
        (vaccinationRecord as any)?.lot?.batch_number ||
        ""
      setFormData({
        vaccineId: vaccinationRecord.vaccine_id?.toString() || vaccinationRecord.vaccine?.id?.toString() || "",
        vaccineName: vaccinationRecord.vaccine?.name || "",
        dateAdministered: new Date().toISOString().split("T")[0], // Today's date
        batchNumber: prefillBatchOpen,
        doseMl: "",
        doseNumber: "",
      })
      setIsBatchPrefilled(!!prefillBatchOpen)
    } else if (isOpen) {
      // Reset form when opening without a specific record
      setFormData({
        vaccineId: "",
        vaccineName: "",
        dateAdministered: new Date().toISOString().split("T")[0],
        batchNumber: "",
        doseMl: "",
        doseNumber: "",
      })
      setIsBatchPrefilled(false)
    }
  }, [vaccinationRecord, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.vaccineId || !formData.dateAdministered || !formData.doseMl) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (including dose in mL)",
        variant: "destructive",
      })
      return
    }

    if (noStock) {
      toast({
        title: "No Stock",
        description: "This facility has no available stock for the selected vaccine. Please receive stock before administering.",
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

      const payload: any = {
        // Backend expects snake_case
        date_administered: formData.dateAdministered,
      }
      if (formData.batchNumber) payload.batch_number = formData.batchNumber
      const doseMlNum = parseFloat(formData.doseMl)
      if (!Number.isNaN(doseMlNum) && doseMlNum > 0) payload.dose_ml = doseMlNum
      const doseNum = parseInt(formData.doseNumber, 10)
      if (!Number.isNaN(doseNum) && doseNum > 0) payload.dose_number = doseNum

      // Debug log the outgoing payload for 422 troubleshooting
      console.groupCollapsed("[RecordVaccinationModal] administerVaccine payload")
      console.log(JSON.stringify(payload, null, 2))
      console.groupEnd()

      const response = await administerVaccine(vaccinationRecordId.toString(), payload)

      if (response.error) {
        console.error("[RecordVaccinationModal] administerVaccine error response:", response)
        toast({
          title: "Error",
          description: (response as any).message || (response as any).error?.message || "Failed to record vaccination",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      toast({
        title: "Success",
        description: "Vaccination recorded successfully",
      })

      // Sync with local context for immediate UI updates in reports
      try {
        const { addVaccination } = (useVaccinations as any)()
        addVaccination({
          childId: childId,
          vaccine: formData.vaccineName,
          date: formData.dateAdministered,
          batchNumber: formData.batchNumber,
          facility: childData?.facility?.name || "Clinic",
          administeredBy: user?.name || user?.email || "Healthcare Worker",
          status: "completed",
          nextDue: "Scheduled", // Placeholder for reports
        })
      } catch (err) {
        console.warn("[RecordVaccinationModal] Context sync skipped:", err)
      }

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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

        {formData.vaccineName && noStock && (
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Inventory is empty for {formData.vaccineName}. Please receive stock before administering.
              </AlertDescription>
            </Alert>
          </div>
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
                    // Try to find the full record to read batch number if present
                    const fullRecord = childData?.vaccination_records?.find((r: any) => (r.vaccine_id?.toString() || r.vaccine?.id?.toString()) === value)
                    const prefillBatch =
                      (fullRecord as any)?.batch_number ||
                      (fullRecord as any)?.batchNumber ||
                      (fullRecord as any)?.lot?.batch_number ||
                      ""
                    setFormData({
                      ...formData,
                      vaccineId: value,
                      vaccineName: selected?.name || "",
                      batchNumber: prefillBatch,
                    })
                    setIsBatchPrefilled(!!prefillBatch)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vaccine" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVaccines.length > 0 &&
                      availableVaccines.map((vaccine: { id: string; name: string; code?: string }) => (
                        <SelectItem key={vaccine.id} value={vaccine.id}>
                          {vaccine.name} {vaccine.code && `(${vaccine.code})`}
                        </SelectItem>
                      ))}
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
            <Label htmlFor="batchNumber">Batch Number</Label>
            <Input
              id="batchNumber"
              placeholder="e.g., PENTA-2024-089"
              value={formData.batchNumber}
              onChange={(e) => {
                setIsBatchPrefilled(false)
                setFormData({ ...formData, batchNumber: e.target.value.toUpperCase() })
              }}
              disabled={isBatchPrefilled}
            />
            <p className="text-xs text-muted-foreground">
              Enter the batch number from the vaccine vial
            </p>
          </div>


          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doseMl">Dose (mL) *</Label>
              <Input
                id="doseMl"
                type="number"
                step="0.1"
                min="0"
                value={formData.doseMl}
                onChange={(e) => setFormData({ ...formData, doseMl: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doseNumber">Dose Number</Label>
              <Select
                value={formData.doseNumber}
                onValueChange={(value) => setFormData({ ...formData, doseNumber: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dose number (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Button type="submit" disabled={isSubmitting || !formData.vaccineId || !formData.doseMl || noStock}>
              {isSubmitting ? "Recording..." : "Record Vaccination"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

