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

interface ScheduleAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  vaccine?: any
}

export function ScheduleAppointmentModal({ isOpen, onClose, vaccine }: ScheduleAppointmentModalProps) {
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("appointments.scheduleAppointment", language)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Select Vaccine</Label>
              <Select defaultValue={vaccine?.vaccine?.toLowerCase()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vaccine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="penta2">Penta 2</SelectItem>
                  <SelectItem value="opv2">OPV 2</SelectItem>
                  <SelectItem value="pcv2">PCV 2</SelectItem>
                  <SelectItem value="rotavirus2">Rotavirus 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Appointment Date</Label>
              <Input type="date" defaultValue={vaccine?.dueDate} />
            </div>
            <div>
              <Label>Appointment Time</Label>
              <Input type="time" />
            </div>
            <div>
              <Label>Select Facility</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addis-ketema">Addis Ketema Health Center</SelectItem>
                  <SelectItem value="kebele-05">Kebele 05 Clinic</SelectItem>
                  <SelectItem value="woreda-03">Woreda 03 Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Input placeholder="Any additional notes..." />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
