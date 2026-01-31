"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, CalendarClock } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { getAppointmentsForChild, type Appointment } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"
import { RescheduleAppointmentModal } from "./reschedule-appointment-modal"

export function ChildAppointments({ childId }: { childId: string }) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await getAppointmentsForChild(childId)

      if (response.error) {
        toast({
          title: "Error",
          description: response.error.message || "Failed to load appointments",
          variant: "destructive",
        })
        return
      }

      if (response.data) {
        const appointmentsData = response.data as any
        // The API client already extracts the 'data' field, so appointmentsData is the array
        const allAppointments = Array.isArray(appointmentsData) ? appointmentsData : []
        
        // Filter appointments: show scheduled/upcoming ones, and recent completed ones
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const filteredAppointments = allAppointments.filter((apt: any) => {
          const appointmentDate = apt.scheduled_at ? new Date(apt.scheduled_at) : new Date(apt.appointment_date || '')
          
          console.log("[ChildAppointments] Filtering appointment:", {
            id: apt.id,
            status: apt.status,
            appointmentDate: appointmentDate.toISOString(),
            today: new Date().toISOString()
          })
          
          // For scheduled appointments, only show future or today's appointments
          if (apt.status === 'scheduled') {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const appointmentDay = new Date(appointmentDate)
            appointmentDay.setHours(0, 0, 0, 0)
            
            const isValid = appointmentDay >= today
            console.log(`Appointment ${apt.id} is valid:`, isValid)
            return isValid
          }
          
          // For completed appointments, show recent ones (last 7 days)
          if (apt.status === 'completed') {
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            return appointmentDate >= sevenDaysAgo
          }
          
          // For other statuses (like missed, cancelled), show recent ones
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return appointmentDate >= thirtyDaysAgo
        })
        
        console.log("[ChildAppointments] Filtered appointments:", {
          total: allAppointments.length,
          filtered: filteredAppointments.length,
          today: today.toISOString()
        })
        
        setAppointments(filteredAppointments)
      }
    } catch (error) {
      console.error("[ChildAppointments] Error:", error)
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [childId, toast])

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsRescheduleModalOpen(true)
  }

  const handleRescheduleSuccess = () => {
    // Refresh appointments after successful reschedule
    fetchAppointments()
  }

  // Format date with Ethiopian date first
  const formatAppointmentDate = (appointment: any) => {
    const date = appointment.scheduled_at ? new Date(appointment.scheduled_at) : new Date(appointment.appointment_date || '')
    
    console.log("[ChildAppointments] Appointment:", {
      id: appointment.id,
      scheduled_at: appointment.scheduled_at,
      appointment_date: appointment.appointment_date,
      status: appointment.status,
      parsedDate: date.toISOString(),
      today: new Date().toISOString()
    })
    
    // Format Gregorian date
    const gregorianDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric"
    })
    
    // Format time
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
    
    return { gregorianDate, time }
  }

  // Clean up Ethiopian time display
  const formatEthiopianTime = (ethiopianTime: string) => {
    if (!ethiopianTime) return ""
    
    console.log("[ChildAppointments] Raw ethiopian_time:", ethiopianTime)
    
    // Remove the "(Morning/Afternoon)" pattern specifically
    let cleanTime = ethiopianTime.replace(/\s*\([^)]*\)\s*/g, "").trim()
    
    console.log("[ChildAppointments] Cleaned ethiopian_time:", cleanTime)
    return cleanTime
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded-md w-1/4" />
          <div className="space-y-3 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold text-foreground">
            {language === "am" ? "ቀጠሮዎች" : "Appointments"}
          </h3>
        </div>

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">
                {language === "am" ? "ምንም ቀጠሮዎች አልተያዘም" : "No scheduled appointments"}
              </p>
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {apt.ethiopian_time && (
                        <span className="font-semibold text-sm text-primary">
                          🕐 {formatEthiopianTime(apt.ethiopian_time)}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatAppointmentDate(apt).gregorianDate} at {formatAppointmentDate(apt).time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      {apt.notes || (language === "am" ? "ምንም ማስታወሻ የለም" : "No notes from health worker")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-fit">
                    {apt.status}
                  </Badge>
                  {apt.visit_number && (
                    <Badge variant="secondary" className="w-fit">
                      Visit {apt.visit_number}
                    </Badge>
                  )}
                  {apt.status === "scheduled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReschedule(apt)}
                      className="flex items-center gap-1"
                    >
                      <CalendarClock className="h-3 w-3" />
                      {language === "am" ? "እንደገና ያዘጋጁ" : "Reschedule"}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {selectedAppointment && (
        <RescheduleAppointmentModal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          appointment={selectedAppointment}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </>
  )
}
