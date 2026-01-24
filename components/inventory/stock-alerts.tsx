"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, TrendingDown, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { RestockOrderModal } from "./restock-order-modal"
import { getStockAlerts } from "@/lib/healthcare-worker-api"

interface Alert {
  id: number
  type: "critical" | "warning" | "info" | "expiring" | "low"
  vaccine: string
  message: string
  priority: "high" | "medium" | "low"
  icon: typeof AlertTriangle
}

export function StockAlerts() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [summary, setSummary] = useState({ total: 0, critical: 0, warning: 0, info: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchAlerts = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await getStockAlerts()

      if (response.error) {
       // console.error("[StockAlerts] Error fetching alerts:", response.error)
        setAlerts([])
        return
      }

      if (response.data) {
        const responseData = response.data as any
        const alertsData = Array.isArray(responseData.data) ? responseData.data : []
        const summaryData = responseData.summary || { total: 0, critical: 0, warning: 0, info: 0 }

        // Transform API alerts to match our Alert interface
        const transformedAlerts: Alert[] = alertsData.map((alert: any) => {
          let type: Alert["type"] = "info"
          let priority: Alert["priority"] = "low"
          let Icon = AlertTriangle

          // Determine type and priority based on alert data
          if (alert.type === "critical" || alert.severity === "critical") {
            type = "critical"
            priority = "high"
            Icon = AlertTriangle
          } else if (alert.type === "warning" || alert.severity === "warning") {
            type = "warning"
            priority = "medium"
            Icon = TrendingDown
          } else if (alert.type === "expiring" || alert.is_expiring_soon) {
            type = "expiring"
            priority = alert.is_expiring_soon ? "high" : "medium"
            Icon = Clock
          } else if (alert.type === "low" || alert.is_low_stock) {
            type = "low"
            priority = "medium"
            Icon = TrendingDown
          }

          return {
            id: typeof alert.id === 'number' ? alert.id : Number(alert.id) || Date.now(),
            type,
            vaccine: alert.vaccine?.name || alert.vaccine_name || "Unknown",
            message: alert.message || alert.description || "Stock alert",
            priority,
            icon: Icon,
          }
        })

        setAlerts(transformedAlerts)
        setSummary(summaryData)
      } else {
        setAlerts([])
      }
    } catch (error) {
      console.error("[StockAlerts] Error:", error)
      setAlerts([])
    } finally {
      if (showRefreshIndicator) {
        setIsRefreshing(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const handleTakeAction = (alert: (typeof alerts)[0]) => {
    setSelectedAlert(alert)
    setIsModalOpen(true)
  }

  const handleViewAllAlerts = () => {
    setShowAllAlerts(!showAllAlerts)
  }

  const handleRefresh = () => {
    fetchAlerts(true)
  }

  const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, 3)
  const criticalCount = summary.critical || alerts.filter((a) => a.priority === "high").length

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="space-y-2 w-full">
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("inventory.stockAlerts", language) || "Stock Alerts"}
            </h3>
            {summary.total > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {summary.total} total alert{summary.total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {criticalCount} {t("inventory.critical", language) || "Critical"}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No stock alerts</p>
            <p className="text-sm mt-1">All inventory levels are adequate</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedAlerts.map((alert) => {
                const Icon = alert.icon
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "border rounded-lg p-3 space-y-2 transition-colors",
                      alert.priority === "high"
                        ? "border-destructive bg-destructive/5 hover:bg-destructive/10"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Icon
                        className={cn(
                          "h-4 w-4 mt-0.5 flex-shrink-0",
                          alert.priority === "high" ? "text-destructive" : "text-accent",
                        )}
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
                        {t("inventory.takeAction", language) || "Take Action"}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>

            {alerts.length > 3 && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="outline" className="w-full bg-transparent" onClick={handleViewAllAlerts}>
                  {showAllAlerts
                    ? t("inventory.showLessAlerts", language) || "Show Less"
                    : t("inventory.viewAllAlerts", language) || `View All (${alerts.length})`}
                </Button>
              </div>
            )}
          </>
        )}
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
