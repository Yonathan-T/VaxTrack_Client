"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { getAppointmentsList, Appointment } from "@/lib/healthcare-worker-api"

interface AppointmentCalendarProps {
  onDateSelect?: (date: Date) => void
  selectedDate?: Date
}

export function AppointmentCalendar({ onDateSelect, selectedDate }: AppointmentCalendarProps) {
  const { language } = useLanguage()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i)

  const monthYear = currentDate.toLocaleString(language === "am" ? "am-ET" : "en-US", {
    month: "long",
    year: "numeric",
  })

  const dayNames = [
    t("calendar.sunday", language),
    t("calendar.monday", language),
    t("calendar.tuesday", language),
    t("calendar.wednesday", language),
    t("calendar.thursday", language),
    t("calendar.friday", language),
    t("calendar.saturday", language),
  ]

  // Fetch appointments for the current month
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      try {
        const response = await getAppointmentsList({ all: true })
        if (response.error) {
          console.error("[AppointmentCalendar] Error fetching appointments:", response.error)
          setAppointments([])
          return
        }

        const appointmentsData = response.data as any
        const appointmentsArray = Array.isArray(appointmentsData?.data)
          ? appointmentsData.data
          : Array.isArray(appointmentsData)
            ? appointmentsData
            : []

        setAppointments(appointmentsArray)
      } catch (error) {
        console.error("[AppointmentCalendar] Error:", error)
        setAppointments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [currentDate])

  const getAppointmentCountForDay = (day: number): number => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateStr = date.toISOString().split('T')[0]

    return appointments.filter((apt) => {
      const aptDate = apt.scheduled_at || apt.scheduled_date || apt.appointment_date || apt.dateTime
      if (!aptDate) return false

      const appointmentDate = new Date(aptDate)
      return (
        appointmentDate.getDate() === day &&
        appointmentDate.getMonth() === currentDate.getMonth() &&
        appointmentDate.getFullYear() === currentDate.getFullYear()
      )
    }).length
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    if (onDateSelect) {
      const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      onDateSelect(selected)
    }
  }

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    )
  }

  const totalAppointments = appointments.length

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">{monthYear}</h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            title={t("calendar.previousMonth", language)}
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            title={t("calendar.nextMonth", language)}
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day.slice(0, 3)}
          </div>
        ))}

        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-10" />
        ))}

        {days.map((day) => {
          const appointmentCount = getAppointmentCountForDay(day)
          const todayFlag = isToday(day)
          const selected = isSelected(day)

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={isLoading}
              className={cn(
                "h-10 rounded-md border border-border p-1 hover:bg-muted transition-colors relative cursor-pointer flex items-center justify-center",
                todayFlag && "border-primary bg-primary/5",
                selected && "border-primary bg-primary/10 ring-2 ring-primary",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="text-xs font-medium text-foreground">{day}</div>
              {appointmentCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] px-1 h-3 leading-none"
                >
                  {appointmentCount}
                </Badge>
              )}
            </button>
          )
        })}
      </div>

      {isLoading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{t("common.loading", language) || "Loading..."}</span>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-muted-foreground">{t("calendar.today", language)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-[10px] h-3 px-1">
            {totalAppointments}
          </Badge>
          <span className="text-muted-foreground">{t("calendar.appointments", language)}</span>
        </div>
      </div>
    </Card>
  )
}
