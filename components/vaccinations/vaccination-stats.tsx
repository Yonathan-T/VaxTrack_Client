"use client"

import { Card } from "@/components/ui/card"
import { Syringe, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function VaccinationStats() {
  const { language } = useLanguage()

  const stats = [
    {
      title: t("vaccinations.stats.todaysVaccinations", language),
      value: "34",
      change: `8 ${t("vaccinations.stats.pending", language)}`,
      icon: Syringe,
      color: "text-primary",
    },
    {
      title: t("vaccinations.stats.completedThisWeek", language),
      value: "187",
      change: `+23% ${t("vaccinations.stats.fromLastWeek", language)}`,
      icon: CheckCircle2,
      color: "text-secondary",
    },
    {
      title: t("vaccinations.stats.scheduledThisWeek", language),
      value: "156",
      change: t("vaccinations.stats.nextSevenDays", language),
      icon: Clock,
      color: "text-accent",
    },
    {
      title: t("vaccinations.stats.overdue", language),
      value: "23",
      change: t("vaccinations.stats.requiresFollowUp", language),
      icon: AlertTriangle,
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
