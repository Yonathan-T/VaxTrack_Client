"use client"

import { Card } from "@/components/ui/card"
import { Package, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"

export function InventoryOverview() {
  const { language } = useLanguage()

  const stats = [
    {
      title: t("inventory.stats.totalVaccineTypes", language),
      value: "15",
      change: t("inventory.stats.allEPIVaccines", language),
      icon: Package,
      color: "text-primary",
    },
    {
      title: t("inventory.stats.lowStockItems", language),
      value: "3",
      change: t("inventory.stats.requiresRestocking", language),
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      title: t("inventory.stats.expiringoon", language),
      value: "2",
      change: t("inventory.stats.withinThirtyDays", language),
      icon: TrendingDown,
      color: "text-accent",
    },
    {
      title: t("inventory.stats.wellStocked", language),
      value: "10",
      change: t("inventory.stats.adequateSupply", language),
      icon: CheckCircle2,
      color: "text-secondary",
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
