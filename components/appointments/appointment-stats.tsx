"use client"

import { Card } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function AppointmentStats() {
  const { language } = useLanguage()

  const stats = [
    {
      title: t("appointments.stats.todaysAppointments", language),
      value: "12",
      change: `4 ${t("appointments.stats.completed", language)}`,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: t("appointments.stats.thisWeek", language),
      value: "156",
      change: `23 ${t("appointments.stats.pendingConfirmation", language)}`,
      icon: Clock,
      color: "text-secondary",
    },
    {
      title: t("appointments.stats.completedThisMonth", language),
      value: "89",
      change: t("appointments.stats.thisMonth", language),
      icon: CheckCircle2,
      color: "text-accent",
    },
    {
      title: t("appointments.stats.missed", language),
      value: "7",
      change: t("appointments.stats.requiresFollowUp", language),
      icon: XCircle,
      color: "text-destructive",
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <Icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
