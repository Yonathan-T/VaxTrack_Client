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

// Ethiopian Date Conversion Function
const getEthiopianDate = async (date: string, language: string) => {
  try {
    let gcDate: string = ""
    
    if (date.includes('/')) {
      const parts = date.split('/')
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0')
        const day = parts[1].padStart(2, '0')
        const year = parts[2]
        gcDate = `${year}-${month}-${day}`
      }
    } else if (date.includes('T')) {
      const utcDate = new Date(date)
      const ethiopianDateObj = new Date(utcDate.getTime() + (3 * 60 * 60 * 1000)) // Add 3 hours for Ethiopia
      gcDate = ethiopianDateObj.toISOString().split('T')[0]
    } else if (date.length === 10 && date.includes('-')) {
      gcDate = date
    } else {
      const dateObj = new Date(date)
      gcDate = dateObj.toISOString().split('T')[0]
    }
    
    const response = await fetch(`https://api.ethioall.com/convert/api?gc=${gcDate}`)
    const data = await response.json()
    
    if (data && data.length > 0) {
      const ethDate = data[0]
      const monthName = language === "en" ? ethDate.month_name.english : ethDate.month_name.amharic
      const dayName = language === "en" ? ethDate.day_name.english : ethDate.day_name.amharic
      
      return {
        date: `${ethDate.day} ${monthName} ${ethDate.year}`,
        dayName: dayName,
        fullDate: `${dayName}, ${ethDate.day} ${monthName} ${ethDate.year}`
      }
    }
  } catch (error) {
    console.error("Error converting to Ethiopian date:", error)
    const dateObj = new Date(date)
    const ethiopianYear = dateObj.getFullYear() - 8
    const fallbackMonth = language === "en" ? "የካቲት" : "የካቲት"
    const fallbackDay = language === "en" ? "ሐሙስ" : "ሐሙስ"
    
    return {
      date: `${dateObj.getDate()} ${fallbackMonth} ${ethiopianYear}`,
      dayName: fallbackDay,
      fullDate: `${fallbackDay}, ${dateObj.getDate()} ${fallbackMonth} ${ethiopianYear}`
    }
  }
  
  return null
}

// Ethiopian Date Converter Component
const EthiopianDateConverter = ({ date, language }: { date: string | null | undefined, language: string }) => {
  const [ethiopianDate, setEthiopianDate] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const convertToEthiopian = async () => {
      if (!date) return
      
      setLoading(true)
      try {
        const result = await getEthiopianDate(date, language)
        if (result) {
          setEthiopianDate(result.fullDate)
        }
      } catch (error) {
        console.error("Error in Ethiopian date conversion:", error)
      } finally {
        setLoading(false)
      }
    }
    
    convertToEthiopian()
  }, [date, language])

  if (loading) {
    return <span className="text-xs text-muted-foreground">Loading...</span>
  }

  return <span className="text-xs text-muted-foreground">{ethiopianDate || "N/A"}</span>
}

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
        
        const upcomingAppointments = allAppointments.filter(apt => {
          const appointmentDate = new Date(apt.scheduled_at || apt.appointment_date || '')
          const appointmentDay = new Date(appointmentDate)
          appointmentDay.setHours(0, 0, 0, 0)
          
          // Show upcoming or today's scheduled appointments
          return apt.status === 'scheduled' && appointmentDay >= today
        })
        
        const missedAppointments = allAppointments.filter(apt => {
          const appointmentDate = new Date(apt.scheduled_at || apt.appointment_date || '')
          const appointmentDay = new Date(appointmentDate)
          appointmentDay.setHours(0, 0, 0, 0)
          
          // Show past scheduled appointments (missed)
          return apt.status === 'scheduled' && appointmentDay < today
        })
        
        const recentCompleted = allAppointments.filter(apt => {
          const appointmentDate = new Date(apt.scheduled_at || apt.appointment_date || '')
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          
          // Show recent completed appointments (last 7 days)
          return apt.status === 'completed' && appointmentDate >= sevenDaysAgo
        })
        
        // Combine: upcoming + missed + recent completed
        const filteredAppointments = [...upcomingAppointments, ...missedAppointments, ...recentCompleted]
        
        console.log("[ChildAppointments] Filtered appointments:", {
          total: allAppointments.length,
          upcoming: upcomingAppointments.length,
          missed: missedAppointments.length,
          recentCompleted: recentCompleted.length,
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
            appointments.map((apt) => {
              const appointmentDate = new Date(apt.scheduled_at || apt.appointment_date || '')
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const appointmentDay = new Date(appointmentDate)
              appointmentDay.setHours(0, 0, 0, 0)
              
              const isPast = appointmentDay < today
              const isMissed = isPast && apt.status === 'scheduled'
              const isCompleted = apt.status === 'completed'
              
              return (
                <div 
                  key={apt.id} 
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPast 
                      ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700' 
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isPast 
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' 
                        : 'bg-green-200 dark:bg-green-700 text-green-600 dark:text-green-300'
                    }`}>
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {apt.scheduled_at && (
                          <span className="font-semibold text-sm text-primary">
                            🕐 {(() => {
                              const utcTime = new Date(apt.scheduled_at)
                              const ethiopianTime = new Date(utcTime.getTime() + (3 * 60 * 60 * 1000)) // Add 3 hours for Ethiopia
                              return ethiopianTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                            })()}
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatAppointmentDate(apt).gregorianDate} at {formatAppointmentDate(apt).time}
                        </span>
                      </div>
                      {apt.scheduled_at && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Ethiopian Date: <EthiopianDateConverter 
                            date={apt.scheduled_at}
                            language={language}
                          />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground italic">
                        {apt.notes || (language === "am" ? "ምንም ማስታወሻ የለም" : "No notes from health worker")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`w-fit ${
                        isMissed 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' 
                          : isCompleted 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
                      }`}
                    >
                      {isMissed 
                        ? (language === "am" ? "ተወዋ" : "Missed")
                        : isCompleted 
                          ? (language === "am" ? "ተጠናቋል" : "Completed")
                          : (language === "am" ? "ተያዘ" : "Scheduled")
                      }
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
              )
            })
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
