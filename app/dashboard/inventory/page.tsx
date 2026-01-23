"use client"

import React from "react"
import * as XLSX from "xlsx"

import { InventoryOverview } from "@/components/inventory/inventory-overview"
import { VaccineStockList } from "@/components/inventory/vaccine-stock-list"
import { StockAlerts } from "@/components/inventory/stock-alerts"
import { Button } from "@/components/ui/button"
import { Plus, Download, Trash2 } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
// Use live inventory from context instead of mock data
import { useInventory } from "@/lib/inventory-context"
import { RoleProtected } from "@/lib/role-protected"
import { useUser } from "@/lib/user-context"
import { Suspense, useState } from "react"
import type { ReactNode } from "react"
import { GlobalWastageModal } from "@/components/inventory/global-wastage-modal"

class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error("[v0] ErrorBoundary caught:", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold">Failed to load inventory component</p>
          <p className="text-red-600 text-sm mt-1">Please refresh the page or try again later</p>
        </div>
      )
    }

    return this.props.children
  }
}

function InventoryLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="h-40 bg-muted rounded-lg animate-pulse" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-muted rounded-lg animate-pulse" />
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const { user } = useUser()
  const { stock } = useInventory()
  const [isWastageOpen, setIsWastageOpen] = useState(false)

  const handleExport = () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const currentTime = new Date().toLocaleTimeString()

      const live = Array.isArray(stock) ? stock : []
      const totalVaccines = live.length
      const adequateStock = live.filter((v) => v.status === "adequate").length
      const lowStock = live.filter((v) => v.status === "low").length
      const criticalStock = live.filter((v) => v.status === "critical").length
      const totalQuantity = live.reduce((sum, v) => sum + (v.quantity || 0), 0)
      const totalMinStock = live.reduce((sum, v) => sum + (v.minStock || 0), 0)

      // Check for expiring soon vaccines
      const expiringVaccines = live.filter((v) => {
        const today = new Date()
        const expiry = new Date(v.expiryDate || "")
        const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0
      })

      const expiredVaccines = live.filter((v) => {
        const today = new Date()
        const expiry = new Date(v.expiryDate || "")
        return expiry < today
      })

      const reportData: (string | number)[][] = []

      // ... (sections removed for brevity, will keep them in the actual replace)
      // Header section
      reportData.push([t("inventory.report.title", language)])
      reportData.push([
        `${t("inventory.report.generated", language)}: ${today} ${t("inventory.report.at", language)} ${currentTime}`,
      ])
      reportData.push([`${t("inventory.report.facility", language)}: ${t("inventory.report.healthCenter", language)}`])
      reportData.push([])

      // Summary Statistics Section
      reportData.push([t("inventory.report.summaryStatistics", language)])
      reportData.push([t("inventory.report.totalVaccineTypes", language), totalVaccines])
      reportData.push([
        t("inventory.report.totalQuantity", language),
        `${totalQuantity} ${t("inventory.report.units", language)}`,
      ])
      reportData.push([
        t("inventory.report.totalMinimumStock", language),
        `${totalMinStock} ${t("inventory.report.units", language)}`,
      ])
      reportData.push([
        t("inventory.report.stockCoverage", language),
        `${((totalQuantity / (totalMinStock || 1)) * 100).toFixed(1)}%`,
      ])
      reportData.push([])

      // Stock Status Summary
      reportData.push([t("inventory.report.stockStatusSummary", language)])
      reportData.push([
        t("inventory.report.adequateStock", language),
        `${adequateStock} ${t("inventory.report.vaccines", language)}`,
      ])
      reportData.push([
        t("inventory.report.lowStock", language),
        `${lowStock} ${t("inventory.report.vaccines", language)}`,
      ])
      reportData.push([
        t("inventory.report.criticalStock", language),
        `${criticalStock} ${t("inventory.report.vaccines", language)}`,
      ])
      reportData.push([])

      // Alerts Section
      reportData.push([t("inventory.report.alertsWarnings", language)])
      reportData.push([
        t("inventory.report.expiringWithin30Days", language),
        `${expiringVaccines.length} ${t("inventory.report.vaccines", language)}`,
      ])
      reportData.push([
        t("inventory.report.alreadyExpired", language),
        `${expiredVaccines.length} ${t("inventory.report.vaccines", language)}`,
      ])
      reportData.push([])

      // Detailed Inventory Data Headers
      reportData.push([t("inventory.report.detailedInventory", language)])
      reportData.push([
        t("inventory.report.vaccineName", language),
        t("inventory.report.batchNumber", language),
        t("inventory.report.currentQuantity", language),
        t("inventory.report.minimumStock", language),
        t("inventory.report.stockPercentage", language),
        t("inventory.report.expiryDate", language),
        t("inventory.report.daysUntilExpiry", language),
        t("inventory.report.manufacturer", language),
        t("inventory.report.status", language),
      ])

      // Detailed Inventory Data Rows
      live.forEach((vaccine) => {
        const stockPercentage = Math.min((vaccine.quantity / (vaccine.minStock || 1)) * 100, 100)
        const today = new Date()
        const expiry = new Date(vaccine.expiryDate || "")
        const daysUntilExpiry = isNaN(expiry.getTime()) ? 0 : Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        reportData.push([
          vaccine.name || "Unknown",
          vaccine.batchNumber || "N/A",
          vaccine.quantity || 0,
          vaccine.minStock || 0,
          `${stockPercentage.toFixed(1)}%`,
          vaccine.expiryDate || "N/A",
          daysUntilExpiry,
          vaccine.manufacturer || "N/A",
          vaccine.status || "N/A",
        ])
      })

      reportData.push([])

      // Critical Stock Items
      if (criticalStock > 0) {
        reportData.push([t("inventory.report.criticalItems", language)])
        reportData.push([
          t("inventory.report.vaccineName", language),
          t("inventory.report.batchNumber", language),
          t("inventory.report.currentQuantity", language),
          t("inventory.report.minimumStock", language),
          t("inventory.report.manufacturer", language),
        ])
        live
          .filter((v) => v.status === "critical")
          .forEach((vaccine) => {
            reportData.push([
              vaccine.name || "N/A",
              vaccine.batchNumber || "N/A",
              vaccine.quantity || 0,
              vaccine.minStock || 0,
              vaccine.manufacturer || "N/A",
            ])
          })
        reportData.push([])
      }

      // Expiring Soon Items
      if (expiringVaccines.length > 0) {
        reportData.push([t("inventory.report.expiringVaccines", language)])
        reportData.push([
          t("inventory.report.vaccineName", language),
          t("inventory.report.batchNumber", language),
          t("inventory.report.expiryDate", language),
          t("inventory.report.daysUntilExpiry", language),
          t("inventory.report.currentQuantity", language),
        ])
        expiringVaccines.forEach((vaccine) => {
          const today = new Date()
          const expiry = new Date(vaccine.expiryDate || "")
          const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          reportData.push([vaccine.name || "N/A", vaccine.batchNumber || "N/A", vaccine.expiryDate || "N/A", daysUntilExpiry, vaccine.quantity || 0])
        })
        reportData.push([])
      }

      // Recommendations
      reportData.push([t("inventory.report.recommendations", language)])
      if (criticalStock > 0) {
        reportData.push([`- ${t("inventory.report.urgentRestock", language)}`])
      }
      if (lowStock > 0) {
        reportData.push([`- ${t("inventory.report.scheduleRestock", language)}`])
      }
      if (expiringVaccines.length > 0) {
        reportData.push([`- ${t("inventory.report.prioritizeExpiring", language)}`])
      }
      reportData.push([`- ${t("inventory.report.reviewConsumption", language)}`])

      const ws = XLSX.utils.aoa_to_sheet(reportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Inventory Report")

      // Generate Excel file as blob and trigger download
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `inventory-report-${language}-${today}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: t("inventory.exportSuccess", language),
        description: `${t("inventory.reportDownloaded", language)} - ${totalVaccines} ${t("inventory.report.vaccines", language)}, ${criticalStock} ${t("inventory.report.criticalItems", language)}`,
      })
    } catch (error) {
      console.error("[v0] Export error:", error)
      toast({
        title: language === "en" ? "Export Failed" : "ወደ ውጭ መላክ ተስፋ ቢል",
        description: language === "en" ? "Failed to export inventory report" : "የእቃ ምግበር ሪፖርት መላክ ወደ ውጭ ተወግዶ",
        variant: "destructive",
      })
    }
  }

  const canAddStock = user?.role === "health_official" || user?.role === "admin" || user?.role === "system_administrator" || user?.role === "super_admin" || user?.role === "healthcare_worker"

  return (
    <RoleProtected allowedRoles={["admin", "healthcare_worker", "system_administrator", "super_admin", "health_official", "woreda_officer"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("inventory.title", language)}</h1>
            <p className="text-muted-foreground">{t("inventory.subtitle", language)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t("inventory.export", language)}
            </Button>
            {canAddStock && (
              <>
                <GlobalWastageModal>
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("inventory.recordWastage", language)}
                  </Button>
                </GlobalWastageModal>
                <Link href="/dashboard/inventory/add-stock">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("inventory.addStock", language)}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <Suspense fallback={<InventoryLoadingFallback />}>
          <ErrorBoundary>
            <InventoryOverview />
          </ErrorBoundary>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ErrorBoundary>
                <VaccineStockList />
              </ErrorBoundary>
            </div>
            <div>
              <ErrorBoundary>
                <StockAlerts />
              </ErrorBoundary>
            </div>
          </div>
        </Suspense>
      </div>
    </RoleProtected>
  )
}
