"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Users, Syringe, Calendar, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"

export function DashboardStats() {
  const { language } = useLanguage()

  const stats = useMemo(
    () => [
      {
        title: t("dashboard.stats.totalChildren", language),
        value: 1247,
        change: t("dashboard.stats.totalChildrenChange", language),
        icon: Users,
        color: "text-primary",
        bgGradient: "from-blue-500/10 to-blue-600/5",
      },
      {
        title: t("dashboard.stats.vaccinationsToday", language),
        value: 34,
        change: t("dashboard.stats.vaccinationsTodayChange", language),
        icon: Syringe,
        color: "text-green-600",
        bgGradient: "from-green-500/10 to-green-600/5",
      },
      {
        title: t("dashboard.stats.upcomingAppointments", language),
        value: 156,
        change: t("dashboard.stats.upcomingAppointmentsChange", language),
        icon: Calendar,
        color: "text-purple-600",
        bgGradient: "from-purple-500/10 to-purple-600/5",
      },
      {
        title: t("dashboard.stats.missedVaccinations", language),
        value: 23,
        change: t("dashboard.stats.missedVaccinationsChange", language),
        icon: AlertTriangle,
        color: "text-destructive",
        bgGradient: "from-red-500/10 to-red-600/5",
      },
    ],
    [language],
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.title}
            className={cn(
              "p-4 sm:p-6 relative overflow-hidden",
              "transition-all duration-500 ease-out",
              "hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1",
              "border-l-4 animate-fade-in-up"
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
