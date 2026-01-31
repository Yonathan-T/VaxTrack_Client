"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { getSuggestedSlots, rescheduleAppointment, type Appointment } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"

interface RescheduleAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment
  onSuccess: () => void
}

interface SuggestedSlot {
  time: string
  datetime: string
  ethiopian_time: string
  booked_count: number
  capacity: number
  remaining: number
  is_available: boolean
}

export function RescheduleAppointmentModal({ 
  isOpen, 
  onClose, 
  appointment, 
  onSuccess 
}: RescheduleAppointmentModalProps) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [suggestedSlots, setSuggestedSlots] = useState<{ [date: string]: SuggestedSlot[] }>({})
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; slot: SuggestedSlot } | null>(null)
  const [rescheduledReason, setRescheduledReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debug logging
  console.log("[RescheduleAppointmentModal] Appointment received:", appointment)

  useEffect(() => {
    if (isOpen && appointment) {
      console.log("[RescheduleAppointmentModal] Opening with appointment:", appointment)
      fetchSuggestedSlots()
    }
  }, [isOpen, appointment])

  const fetchSuggestedSlots = async () => {
    if (!appointment?.id) {
      console.error("[RescheduleAppointmentModal] No appointment ID available")
      return
    }
    
    try {
      setIsLoading(true)
      const response = await getSuggestedSlots(appointment.id)
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error.message || "Failed to fetch suggested slots",
          variant: "destructive",
        })
        return
      }

      if (response.data) {
        const slotsData = response.data as any
        setSuggestedSlots(slotsData.suggested_slots || {})
      }
    } catch (error) {
      console.error("[RescheduleAppointmentModal] Error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch suggested slots",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!selectedSlot || !rescheduledReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a time slot and provide a reason",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await rescheduleAppointment(appointment.id, {
        scheduled_at: selectedSlot.slot.datetime,
        rescheduled_reason: rescheduledReason.trim(),
        cascade: true
      })

      if (response.error) {
        toast({
          title: "Error",
          description: response.error.message || "Failed to reschedule appointment",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully",
      })

      onSuccess()
      onClose()
      // Reset form
      setSelectedSlot(null)
      setRescheduledReason("")
    } catch (error) {
      console.error("[RescheduleAppointmentModal] Error:", error)
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedSlot(null)
    setRescheduledReason("")
    onClose()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {language === "am" ? "ቀጠሮ እንደገና መደበቅ" : "Reschedule Appointment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Appointment Info */}
          {appointment && (
            <div className="p-4 bg-muted/20 rounded-lg">
              <h4 className="font-medium mb-2">
                {language === "am" ? "የአሁኑ ቀጠሮ" : "Current Appointment"}
              </h4>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {appointment.vaccination_records && appointment.vaccination_records.length > 0
                    ? appointment.vaccination_records.map((record: any) => 
                        record.vaccine?.name || record.vaccineName || "Unknown Vaccine"
                      ).join(", ")
                    : appointment.notes || "General Appointment"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.scheduled_at ? new Date(appointment.scheduled_at).toLocaleDateString() : new Date(appointment.appointment_date || '').toLocaleDateString()} 
                  {appointment.scheduled_at && ` at ${new Date(appointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>
          )}

          {/* Suggested Slots */}
          <div>
            <Label className="text-base font-medium">
              {language === "am" ? "የተጠቁሙት ጊዜያት" : "Available Time Slots"}
            </Label>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">
                  {language === "am" ? "በመጫን ላይ..." : "Loading..."}
                </span>
              </div>
            ) : Object.keys(suggestedSlots).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === "am" ? "ምንም የተጠቁሙት ጊዜያት የሉም" : "No available time slots"}
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {Object.entries(suggestedSlots).map(([date, slots]) => (
                  <div key={date} className="space-y-2">
                    <h4 className="font-medium text-sm">{formatDate(date)}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {slots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedSlot?.date === date && selectedSlot?.slot.time === slot.time ? "default" : "outline"}
                          size="sm"
                          disabled={!slot.is_available}
                          onClick={() => setSelectedSlot({ date, slot })}
                          className="h-auto p-3 flex flex-col items-start"
                        >
                          <div className="flex items-center gap-1 w-full">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs font-medium">{slot.time}</span>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {slot.ethiopian_time}
                          </span>
                          {!slot.is_available && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              {language === "am" ? "ተሟግቷል" : "Booked"}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reschedule Reason */}
          <div>
            <Label htmlFor="reason">
              {language === "am" ? "የመቀየር ምክንያት" : "Reason for Rescheduling"}
            </Label>
            <Input
              id="reason"
              value={rescheduledReason}
              onChange={(e) => setRescheduledReason(e.target.value)}
              placeholder={language === "am" ? "ምክንያቱን ያስገቡ..." : "Enter reason for rescheduling..."}
              className="mt-2"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {language === "am" ? "ይቅር" : "Cancel"}
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!selectedSlot || !rescheduledReason.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {language === "am" ? "በመስራት ላይ..." : "Rescheduling..."}
                </>
              ) : (
                language === "am" ? "ቀጠሮውን እንደገና ያዘጋጁ" : "Reschedule Appointment"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
