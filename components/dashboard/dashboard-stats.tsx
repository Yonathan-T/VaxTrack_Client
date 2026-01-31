"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Users, Syringe, Calendar, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { getChildrenList, getAppointmentsForChild, getChildVaccinationStatus } from "@/lib/healthcare-worker-api"

export function DashboardStats() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalChildren: 0,
    vaccinationsToday: 0,
    upcomingAppointments: 0,
    overdueVaccinations: 0,
    weeklyNewChildren: 0
  })

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true)
        
        // Fetch all children
        const childrenResponse = await getChildrenList()
        if (childrenResponse.error) {
          console.error("Failed to fetch children:", childrenResponse.error)
          return
        }

        const childrenData = childrenResponse.data as any
        const children = Array.isArray(childrenData) ? childrenData : []

        // Fetch vaccination status for each child to get accurate counts
        const childrenWithStatus = await Promise.all(
          children.map(async (child: any) => {
            try {
              const statusResponse = await getChildVaccinationStatus(child.id)
              if (!statusResponse.error && statusResponse.data) {
                const statusData = statusResponse.data as any
                return {
                  ...child,
                  vaccinationStatus: statusData.vaccination_status,
                  apiStatus: statusData.vaccination_status.status_label
                }
              }
              return child
            } catch (error) {
              console.error(`Failed to fetch status for child ${child.id}:`, error)
              return child
            }
          })
        )

        // Calculate stats
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        // Count overdue children
        const overdueCount = childrenWithStatus.filter(child => 
          child.apiStatus === "overdue"
        ).length

        // Calculate weekly new children (children registered in last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const weeklyNewCount = children.filter(child => {
          const createdAt = new Date(child.created_at || child.createdAt)
          return createdAt >= sevenDaysAgo
        }).length

        // Fetch appointments for upcoming count
        let upcomingCount = 0
        let vaccinationsTodayCount = 0
        
        for (const child of children.slice(0, 10)) { // Limit to first 10 for performance
          try {
            const appointmentsResponse = await getAppointmentsForChild(child.id)
            if (!appointmentsResponse.error && appointmentsResponse.data) {
              const appointments = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : []
              
              // Count upcoming appointments (next 7 days)
              const sevenDaysFromNow = new Date()
              sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
              
              appointments.forEach((apt: any) => {
                const aptDate = new Date(apt.scheduled_at || apt.appointment_date || '')
                if (aptDate >= today && aptDate <= sevenDaysFromNow && apt.status === 'scheduled') {
                  upcomingCount++
                }
                if (aptDate.toDateString() === today.toDateString() && apt.status === 'scheduled') {
                  vaccinationsTodayCount++
                }
              })
            }
          } catch (error) {
            console.error(`Failed to fetch appointments for child ${child.id}:`, error)
          }
        }

        setStats({
          totalChildren: children.length,
          vaccinationsToday: vaccinationsTodayCount,
          upcomingAppointments: upcomingCount,
          overdueVaccinations: overdueCount,
          weeklyNewChildren: weeklyNewCount
        })

      } catch (error) {
        console.error("Dashboard stats error:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [toast])

  const statsData = useMemo(
    () => [
      {
        title: t("dashboard.stats.totalChildren", language),
        value: stats.totalChildren,
        change: stats.weeklyNewChildren > 0 ? `+${stats.weeklyNewChildren} This week` : "No new children",
        icon: Users,
        color: "text-primary",
        bgGradient: "from-blue-500/10 to-blue-600/5",
      },
      {
        title: t("dashboard.stats.vaccinationsToday", language),
        value: stats.vaccinationsToday,
        change: stats.vaccinationsToday === 0 ? "No pending" : "0 pending",
        icon: Syringe,
        color: "text-green-600",
        bgGradient: "from-green-500/10 to-green-600/5",
      },
      {
        title: t("dashboard.stats.upcomingAppointments", language),
        value: stats.upcomingAppointments,
        change: "Next 7 days",
        icon: Calendar,
        color: "text-purple-600",
        bgGradient: "from-purple-500/10 to-purple-600/5",
      },
      {
        title: t("dashboard.stats.missedVaccinations", language),
        value: stats.overdueVaccinations,
        change: "Requires follow-up",
        icon: AlertTriangle,
        color: "text-destructive",
        bgGradient: "from-red-500/10 to-red-600/5",
      },
    ],
    [stats, language],
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.title}
            className={cn(
              "p-4 sm:p-6 relative overflow-hidden",
              "transition-all duration-500 ease-out",
              "hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1",
              "border-l-4 animate-fade-in-up",
              isLoading && "opacity-50"
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
                "opacity-100"
              )}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2 transition-opacity duration-300">
                  {stat.title}
                </h3>
                <div
                  className={cn(
                    "transition-all duration-500 transform",
                    "opacity-100 scale-100",
                    "hover:scale-110 hover:rotate-12"
                  )}
                >
                  <Icon className={cn("h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0", stat.color, "drop-shadow-sm")} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-bold text-foreground transition-all duration-700">
                  <CountUpAnimation value={stat.value} />
                </p>
                <p className="text-xs text-muted-foreground transition-opacity duration-500">
                  {stat.change}
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
