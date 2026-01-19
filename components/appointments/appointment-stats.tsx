"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { getAppointmentsList, Appointment } from "@/lib/healthcare-worker-api"
import { cn } from "@/lib/utils"

export function AppointmentStats() {
  const { language } = useLanguage()
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    thisWeek: 0,
    completedThisMonth: 0,
    missed: 0,
    completedToday: 0,
    pendingConfirmation: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await getAppointmentsList()

        if (response.error) {
          console.error("[AppointmentStats] Error fetching appointments:", response.error)
          return
        }

        const appointmentsData = response.data as any
        const appointmentsArray = Array.isArray(appointmentsData?.data)
          ? appointmentsData.data
          : Array.isArray(appointmentsData?.appointments)
          ? appointmentsData.appointments
          : Array.isArray(appointmentsData)
          ? appointmentsData
          : []

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 7)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        let todaysCount = 0
        let completedTodayCount = 0
        let thisWeekCount = 0
        let pendingConfirmationCount = 0
        let completedThisMonthCount = 0
        let missedCount = 0

        appointmentsArray.forEach((apt: any) => {
          const aptDate = apt.scheduled_date || apt.appointment_date || apt.dateTime
          if (!aptDate) return

          const appointmentDate = new Date(aptDate)
          const status = apt.status?.toLowerCase() || "scheduled"

          // Today's appointments
          if (
            appointmentDate.getDate() === today.getDate() &&
            appointmentDate.getMonth() === today.getMonth() &&
            appointmentDate.getFullYear() === today.getFullYear()
          ) {
            todaysCount++
            if (status === "completed" || status === "checked-in") {
              completedTodayCount++
            }
          }

          // This week's appointments
          if (appointmentDate >= weekStart && appointmentDate < weekEnd) {
            thisWeekCount++
            if (status === "scheduled" || status === "pending" || status === "confirmed") {
              pendingConfirmationCount++
            }
          }

          // Completed this month
          if (
            appointmentDate >= monthStart &&
            appointmentDate <= monthEnd &&
            (status === "completed" || status === "checked-in")
          ) {
            completedThisMonthCount++
          }

          // Missed appointments
          if (
            appointmentDate < today &&
            (status === "missed" || (status === "scheduled" && appointmentDate < today))
          ) {
            missedCount++
          }
        })

        setStats({
          todaysAppointments: todaysCount,
          thisWeek: thisWeekCount,
          completedThisMonth: completedThisMonthCount,
          missed: missedCount,
          completedToday: completedTodayCount,
          pendingConfirmation: pendingConfirmationCount,
        })
      } catch (error) {
        console.error("[AppointmentStats] Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const statsData = [
    {
      title: t("appointments.stats.todaysAppointments", language) || "Today's Appointments",
      value: stats.todaysAppointments,
      change: `${stats.completedToday} ${t("appointments.stats.completed", language) || "completed"}`,
      icon: Calendar,
      color: "text-primary",
      bgGradient: "from-blue-500/10 to-blue-600/5",
    },
    {
      title: t("appointments.stats.thisWeek", language) || "This Week",
      value: stats.thisWeek,
      change: `${stats.pendingConfirmation} ${t("appointments.stats.pendingConfirmation", language) || "pending confirmation"}`,
      icon: Clock,
      color: "text-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/5",
    },
    {
      title: t("appointments.stats.completedThisMonth", language) || "Completed This Month",
      value: stats.completedThisMonth,
      change: t("appointments.stats.thisMonth", language) || "This month",
      icon: CheckCircle2,
      color: "text-green-600",
      bgGradient: "from-green-500/10 to-green-600/5",
    },
    {
      title: t("appointments.stats.missed", language) || "Missed",
      value: stats.missed,
      change: t("appointments.stats.requiresFollowUp", language) || "Requires follow-up",
      icon: XCircle,
      color: "text-destructive",
      bgGradient: "from-red-500/10 to-red-600/5",
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.title}
            className={cn(
              "p-6 relative overflow-hidden",
              "transition-all duration-500 ease-out",
              "hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1",
              "border-l-4",
              isLoading ? "animate-pulse" : "animate-fade-in-up"
            )}
            style={{
              animationDelay: `${index * 100}ms`,
              borderLeftColor: stat.color === "text-primary" ? "rgb(59 130 246)" : 
                              stat.color === "text-purple-600" ? "rgb(168 85 247)" :
                              stat.color === "text-green-600" ? "rgb(34 197 94)" :
                              "rgb(239 68 68)",
            }}
          >
            {/* Animated background gradient */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
                stat.bgGradient,
                isLoading ? "opacity-30" : "opacity-100"
              )}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground transition-opacity duration-300">
                  {stat.title}
                </h3>
                <div
                  className={cn(
                    "transition-all duration-500 transform",
                    isLoading ? "opacity-50 scale-90" : "opacity-100 scale-100",
                    "hover:scale-110 hover:rotate-12"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Icon className={cn("h-5 w-5", stat.color, "drop-shadow-sm")} />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p
                  className={cn(
                    "text-3xl font-bold text-foreground transition-all duration-700",
                    isLoading && "opacity-50"
                  )}
                >
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 bg-muted rounded animate-pulse" />
                  ) : (
                    <CountUpAnimation value={stat.value} />
                  )}
                </p>
                <p
                  className={cn(
                    "text-xs text-muted-foreground transition-opacity duration-500",
                    isLoading && "opacity-50"
                  )}
                >
                  {isLoading ? (
                    <span className="inline-block w-24 h-3 bg-muted rounded animate-pulse" />
                  ) : (
                    stat.change
                  )}
                </p>
              </div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none opacity-0 hover:opacity-100" />
            
            {/* Pulse ring effect */}
            {!isLoading && (
              <div className={cn(
                "absolute -inset-1 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-500",
                "bg-gradient-to-r",
                stat.color === "text-primary" ? "from-blue-500/20 to-transparent" :
                stat.color === "text-secondary" ? "from-purple-500/20 to-transparent" :
                stat.color === "text-accent" ? "from-green-500/20 to-transparent" :
                "from-red-500/20 to-transparent"
              )} />
            )}
          </Card>
        )
      })}
    </div>
  )
}

// Count-up animation component
function CountUpAnimation({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0)
      return
    }

    setIsAnimating(true)
    const duration = 1000 // 1 second
    const steps = 30
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(Math.ceil(increment * step), value)
      setDisplayValue(current)

      if (step >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
        setTimeout(() => setIsAnimating(false), 200)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span className={cn("inline-block", isAnimating && "scale-110 transition-transform duration-150")}>
      {displayValue.toLocaleString()}
    </span>
  )
}
