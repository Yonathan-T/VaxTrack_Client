"use client"

import { Card } from "@/components/ui/card"
import { Package, TrendingDown, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { useInventory } from "@/lib/inventory-context"
import { useEffect, useState } from "react"

export function InventoryOverview() {
  const { language } = useLanguage()
  const { stock, isLoading } = useInventory()
  const [stats, setStats] = useState({
    totalVaccineTypes: 0,
    lowStockItems: 0,
    expiringSoon: 0,
    wellStocked: 0,
  })

  useEffect(() => {
    if (!isLoading && stock.length > 0) {
      const today = new Date()
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

      const lowStock = stock.filter((item) => item.status === "low" || item.status === "critical").length
      const expiringSoon = stock.filter((item) => {
        const expiry = new Date(item.expiryDate)
        return expiry <= thirtyDaysFromNow && expiry > today
      }).length
      const wellStocked = stock.filter((item) => item.status === "adequate").length

      setStats({
        totalVaccineTypes: stock.length,
        lowStockItems: lowStock,
        expiringSoon,
        wellStocked,
      })
    }
  }, [stock, isLoading])

  const statsConfig = [
    {
      title: t("inventory.stats.totalVaccineTypes", language),
      value: stats.totalVaccineTypes.toString(),
      change: t("inventory.stats.allEPIVaccines", language),
      icon: Package,
      color: "text-primary",
    },
    {
      title: t("inventory.stats.lowStockItems", language),
      value: stats.lowStockItems.toString(),
      change: t("inventory.stats.requiresRestocking", language),
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      title: t("inventory.stats.expiringoon", language),
      value: stats.expiringSoon.toString(),
      change: t("inventory.stats.withinThirtyDays", language),
      icon: TrendingDown,
      color: "text-accent",
    },
    {
      title: t("inventory.stats.wellStocked", language),
      value: stats.wellStocked.toString(),
      change: t("inventory.stats.adequateSupply", language),
      icon: CheckCircle2,
      color: "text-secondary",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat) => {
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
