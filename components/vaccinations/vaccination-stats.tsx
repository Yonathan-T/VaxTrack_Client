"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Syringe, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { getTodayDue, getChildrenList, getAppointmentsList } from "@/lib/healthcare-worker-api"
import { cn } from "@/lib/utils"

export function VaccinationStats() {
  const { language } = useLanguage()
  const [stats, setStats] = useState({
    todaysVaccinations: 0,
    completedThisWeek: 0,
    scheduledThisWeek: 0,
    overdue: 0,
    pending: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [todayDueRes, childrenRes, appointmentsRes] = await Promise.all([
          getTodayDue(),
          getChildrenList(),
          getAppointmentsList(),
        ])

        let todaysVaccinations = 0
        let overdueCount = 0
        let pendingCount = 0

        if (todayDueRes.data) {
          const data = todayDueRes.data as any
          const todayDueChildren = data.data || []
          todaysVaccinations = todayDueChildren.length
          
          todayDueChildren.forEach((child: any) => {
            overdueCount += child.overdue_count || 0
            pendingCount += (child.total_pending || 0) - (child.overdue_count || 0)
          })
        }

        let completedThisWeek = 0
        let scheduledThisWeek = 0
        if (appointmentsRes.data) {
          const appointmentsData = (appointmentsRes.data as any).appointments || appointmentsRes.data
          if (Array.isArray(appointmentsData)) {
            const now = new Date()
            const weekStart = new Date(now)
            weekStart.setDate(now.getDate() - now.getDay())
            weekStart.setHours(0, 0, 0, 0)
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekStart.getDate() + 7)

            appointmentsData.forEach((apt: any) => {
              const aptDate = apt.dateTime || apt.scheduled_date || apt.appointment_date
              if (aptDate) {
                const appointmentDate = new Date(aptDate)
                if (appointmentDate >= weekStart && appointmentDate < weekEnd) {
                  if (apt.status === "completed") {
                    completedThisWeek++
                  } else if (apt.status === "scheduled") {
                    scheduledThisWeek++
                  }
                }
              }
            })
          }
        }

        setStats({
          todaysVaccinations,
          completedThisWeek,
          scheduledThisWeek,
          overdue: overdueCount,
          pending: pendingCount,
        })
      } catch (error) {
        console.error("[VaccinationStats] Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const statsData = [
    {
      title: t("vaccinations.stats.todaysVaccinations", language),
      value: stats.todaysVaccinations,
      change: `${stats.pending} ${t("vaccinations.stats.pending", language)}`,
      icon: Syringe,
      color: "text-primary",
      bgGradient: "from-blue-500/10 to-blue-600/5",
    },
    {
      title: t("vaccinations.stats.completedThisWeek", language),
      value: stats.completedThisWeek,
      change: t("vaccinations.stats.fromLastWeek", language),
      icon: CheckCircle2,
      color: "text-green-600",
      bgGradient: "from-green-500/10 to-green-600/5",
    },
    {
      title: t("vaccinations.stats.scheduledThisWeek", language),
      value: stats.scheduledThisWeek,
      change: t("vaccinations.stats.nextSevenDays", language),
      icon: Clock,
      color: "text-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/5",
    },
    {
      title: t("vaccinations.stats.overdue", language),
      value: stats.overdue,
      change: t("vaccinations.stats.requiresFollowUp", language),
      icon: AlertTriangle,
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
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
                stat.bgGradient,
                isLoading ? "opacity-30" : "opacity-100"
              )}
            />

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

            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none opacity-0 hover:opacity-100" />
          </Card>
        )
      })}
    </div>
  )
}

function CountUpAnimation({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0)
      return
    }

    setIsAnimating(true)
    const duration = 1000
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

