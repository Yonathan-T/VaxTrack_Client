"use client"

import { Card } from "@/components/ui/card"
import { Package, Hourglass, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
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
      bgGradient: "from-blue-500/10 to-blue-600/5",
      borderColor: "rgb(59 130 246)",
    },
    {
      title: t("inventory.stats.lowStockItems", language),
      value: stats.lowStockItems.toString(),
      change: t("inventory.stats.requiresRestocking", language),
      icon: AlertTriangle,
      color: "text-destructive",
      bgGradient: "from-red-500/10 to-red-600/5",
      borderColor: "rgb(239 68 68)",
    },
    {
      title: t("inventory.stats.expiringoon", language),
      value: stats.expiringSoon.toString(),
      change: t("inventory.stats.withinThirtyDays", language),
      icon: Hourglass,
      color: "text-amber-500",
      bgGradient: "from-amber-500/10 to-amber-600/5",
      borderColor: "rgb(245 158 11)",
    },
    {
      title: t("inventory.stats.wellStocked", language),
      value: stats.wellStocked.toString(),
      change: t("inventory.stats.adequateSupply", language),
      icon: CheckCircle2,
      color: "text-green-600",
      bgGradient: "from-green-500/10 to-green-600/5",
      borderColor: "rgb(34 197 94)",
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
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.title}
            className="group p-6 relative overflow-hidden transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1 border-l-4"
            style={{ borderLeftColor: stat.borderColor as any }}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
                stat.bgGradient,
                "opacity-100",
              )}
            />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <Icon className={cn("h-5 w-5 opacity-70 drop-shadow-sm transition-transform duration-500", stat.color, "group-hover:scale-110 group-hover:rotate-12")} />
            </div>
            <div className="relative z-10 space-y-1">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
