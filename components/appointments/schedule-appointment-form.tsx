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
import { AlertCircle, Search, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
import { scheduleAppointment } from "@/lib/healthcare-worker-api"

export function ScheduleAppointmentForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchChild, setSearchChild] = useState("")
  const [selectedChild, setSelectedChild] = useState<any>(null)

  const [formData, setFormData] = useState({
    vaccine: "",
    appointmentDate: "",
    appointmentTime: "",
    facility: "",
    sendSMS: true,
    sendEmail: false,
    notes: "",
  })

  const handleChildSearch = () => {
    setSelectedChild({
      id: "1",
      name: "Abebe Kebede",
      dateOfBirth: "2024-03-15",
      age: "8 months",
      guardian: "Almaz Kebede",
      phone: "+251911234567",
      email: "almaz.kebede@example.com",
      nextDue: "Penta 2",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedChild) {
      setError(t("form.pleaseSelectChild", language) || "Please search and select a child first")
      return
    }

    if (!formData.vaccine) {
      setError(t("form.pleaseSelectVaccine", language) || "Please select a vaccine")
      return
    }

    if (!formData.appointmentDate) {
      setError(t("form.pleaseSelectDate", language) || "Please select an appointment date")
      return
    }

    if (!formData.appointmentTime) {
      setError(t("form.pleaseSelectTime", language) || "Please select an appointment time")
      return
    }

    if (!formData.facility) {
      setError(t("form.pleaseSelectFacility", language) || "Please select a facility")
      return
    }

    setLoading(true)

    try {
      const response = await scheduleAppointment({
        childId: selectedChild.id,
        vaccine: formData.vaccine,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        facility: formData.facility,
        sendSMS: formData.sendSMS,
        sendEmail: formData.sendEmail,
        notes: formData.notes,
      })

      if (response.data) {
        toast({
          title: t("form.success", language) || "Success",
          description: t("form.appointmentScheduledSuccessfully", language) || "Appointment scheduled successfully",
          variant: "default",
        })

        // Redirect after brief delay to show the toast
        setTimeout(() => {
          router.push("/dashboard/appointments")
        }, 1500)
      }
    } catch (err: any) {
      console.log("[v0] Appointment scheduling error:", err)
      setError(
        err.response?.data?.message ||
          t("form.errorSchedulingAppointment", language) ||
          "Failed to schedule appointment. Please try again.",
      )
    } finally {
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
        <h3 className="text-lg font-semibold text-foreground">Select Child</h3>
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
                <p className="text-sm text-muted-foreground">Phone: {selectedChild.phone}</p>
                {selectedChild.nextDue && (
                  <p className="text-sm font-medium text-primary mt-1">Next Due: {selectedChild.nextDue}</p>
                )}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedChild(null)}>
                {t("form.change", language)}
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Appointment Details</h3>

        <div className="space-y-2">
          <Label htmlFor="vaccine">Select Vaccine *</Label>
          <Select value={formData.vaccine} onValueChange={(value) => setFormData({ ...formData, vaccine: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a vaccine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bcg">BCG</SelectItem>
              <SelectItem value="opv0">OPV 0</SelectItem>
              <SelectItem value="penta1">Penta 1</SelectItem>
              <SelectItem value="penta2">Penta 2</SelectItem>
              <SelectItem value="penta3">Penta 3</SelectItem>
              <SelectItem value="opv1">OPV 1</SelectItem>
              <SelectItem value="opv2">OPV 2</SelectItem>
              <SelectItem value="opv3">OPV 3</SelectItem>
              <SelectItem value="pcv1">PCV 1</SelectItem>
              <SelectItem value="pcv2">PCV 2</SelectItem>
              <SelectItem value="pcv3">PCV 3</SelectItem>
              <SelectItem value="measles1">Measles 1</SelectItem>
              <SelectItem value="measles2">Measles 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="appointmentDate">{t("form.appointmentDate", language)} *</Label>
            <Input
              id="appointmentDate"
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentTime">Appointment Time *</Label>
            <Input
              id="appointmentTime"
              type="time"
              value={formData.appointmentTime}
              onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="facility">Select Facility *</Label>
          <Select value={formData.facility} onValueChange={(value) => setFormData({ ...formData, facility: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a facility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="addis_ketema_hc">Addis Ketema Health Center</SelectItem>
              <SelectItem value="woreda_03_clinic">Woreda 03 Clinic</SelectItem>
              <SelectItem value="kebele_05_clinic">Kebele 05 Clinic</SelectItem>
              <SelectItem value="central_hospital">Central Hospital</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Notification Settings</h3>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendSMS"
              checked={formData.sendSMS}
              onCheckedChange={(checked) => setFormData({ ...formData, sendSMS: checked as boolean })}
            />
            <Label htmlFor="sendSMS" className="text-sm font-normal cursor-pointer">
              Send SMS reminder to guardian ({selectedChild?.phone || "phone number"})
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendEmail"
              checked={formData.sendEmail}
              onCheckedChange={(checked) => setFormData({ ...formData, sendEmail: checked as boolean })}
            />
            <Label htmlFor="sendEmail" className="text-sm font-normal cursor-pointer">
              Send email reminder to guardian ({selectedChild?.email || "email address"})
            </Label>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">
          Reminders will be sent 24 hours before the appointment and on the day of the appointment.
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any special instructions or notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || !selectedChild} className="min-w-[180px]">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scheduling...
            </>
          ) : (
            "Schedule Appointment"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
