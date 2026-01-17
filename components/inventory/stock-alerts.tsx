"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { RestockOrderModal } from "./restock-order-modal"

const alerts = [
  {
    id: 1,
    type: "critical",
    vaccine: "Rotavirus",
    message: "Critical stock level - only 95 doses remaining",
    priority: "high",
    icon: AlertTriangle,
  },
  {
    id: 2,
    type: "expiring",
    vaccine: "Rotavirus",
    message: "Expiring in 10 days (2024-11-25)",
    priority: "high",
    icon: Clock,
  },
  {
    id: 3,
    type: "low",
    vaccine: "Penta",
    message: "Below minimum stock level (180/300)",
    priority: "medium",
    icon: TrendingDown,
  },
  {
    id: 4,
    type: "low",
    vaccine: "PCV",
    message: "Below minimum stock level (150/200)",
    priority: "medium",
    icon: TrendingDown,
  },
  {
    id: 5,
    type: "expiring",
    vaccine: "PCV",
    message: "Expiring in 30 days (2024-12-15)",
    priority: "medium",
    icon: Clock,
  },
]

export function StockAlerts() {
  const { language } = useLanguage()
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<(typeof alerts)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const handleTakeAction = (alert: (typeof alerts)[0]) => {
    setSelectedAlert(alert)
    setIsModalOpen(true)
  }

  const handleViewAllAlerts = () => {
    setShowAllAlerts(!showAllAlerts)
    toast({
      title: showAllAlerts ? t("inventory.showingRecentAlerts", language) : t("inventory.showingAllAlerts", language),
      description: showAllAlerts
        ? t("inventory.displayingRecentAlertsOnly", language)
        : `${t("inventory.displayingAll", language)} ${alerts.length} ${t("inventory.alerts", language)}`,
    })
  }

  const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, 3)

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{t("inventory.stockAlerts", language)}</h3>
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {alerts.filter((a) => a.priority === "high").length} {t("inventory.critical", language)}
          </Badge>
        </div>

        <div className="space-y-3">
          {displayedAlerts.map((alert) => {
            const Icon = alert.icon
            return (
              <div
                key={alert.id}
                className={cn(
                  "border rounded-lg p-3 space-y-2",
                  alert.priority === "high" ? "border-destructive bg-destructive/5" : "border-border",
                )}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    className={cn("h-4 w-4 mt-0.5", alert.priority === "high" ? "text-destructive" : "text-accent")}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-foreground">{alert.vaccine}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
                {alert.priority === "high" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleTakeAction(alert)}
                  >
                    {t("inventory.takeAction", language)}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="outline" className="w-full bg-transparent" onClick={handleViewAllAlerts}>
            {showAllAlerts ? t("inventory.showLessAlerts", language) : t("inventory.viewAllAlerts", language)}
          </Button>
        </div>
      </Card>

      {selectedAlert && (
        <RestockOrderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedAlert(null)
          }}
          alert={selectedAlert}
        />
      )}
    </>
  )
}
