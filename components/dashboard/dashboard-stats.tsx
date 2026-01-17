"use client"

import { useMemo } from "react"
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
        value: "1,247",
        change: t("dashboard.stats.totalChildrenChange", language),
        icon: Users,
        color: "text-primary",
      },
      {
        title: t("dashboard.stats.vaccinationsToday", language),
        value: "34",
        change: t("dashboard.stats.vaccinationsTodayChange", language),
        icon: Syringe,
        color: "text-secondary",
      },
      {
        title: t("dashboard.stats.upcomingAppointments", language),
        value: "156",
        change: t("dashboard.stats.upcomingAppointmentsChange", language),
        icon: Calendar,
        color: "text-accent",
      },
      {
        title: t("dashboard.stats.missedVaccinations", language),
        value: "23",
        change: t("dashboard.stats.missedVaccinationsChange", language),
        icon: AlertTriangle,
        color: "text-destructive",
      },
    ],
    [language],
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">{stat.title}</h3>
              <Icon className={cn("h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0", stat.color)} />
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
