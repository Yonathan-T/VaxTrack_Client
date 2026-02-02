"use client"

import React from "react"

import { InventoryOverview } from "@/components/inventory/inventory-overview"
import { VaccineStockList } from "@/components/inventory/vaccine-stock-list"
import { StockAlerts } from "@/components/inventory/stock-alerts"
import { Button } from "@/components/ui/button"
import { Plus, Download, Trash2, FileText, FileSpreadsheet, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
import { useInventory } from "@/lib/inventory-context"
import { RoleProtected } from "@/lib/role-protected"
import { useUser } from "@/lib/user-context"
import { Suspense, useState } from "react"
import type { ReactNode } from "react"
import { GlobalWastageModal } from "@/components/inventory/global-wastage-modal"
import { inventoryApi } from "@/lib/inventory-api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: "pdf" | "csv" | "xlsx") => {
    setIsExporting(true)
    try {
      toast({
        title: language === "am" ? "ወደ ውጭ በመላክ ላይ..." : "Exporting...",
        description: language === "am" ? "ሪፖርቱን እያዘጋጀን ነው..." : "Preparing your report...",
      })

      const result = await inventoryApi.downloadInventoryReport(format)
      
      const response = await fetch(result.url, {
        headers: {
          "Authorization": `Bearer ${result.token}`,
          "Accept": "application/json",
        },
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `inventory-report.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: language === "am" ? "ተሳክቷል" : "Success",
        description: language === "am" ? "ሪፖርቱ በተሳካ ሁኔታ ወርዷል" : "Report downloaded successfully",
      })
    } catch (error) {
      console.error("[Inventory] Export error:", error)
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ሪፖርቱን ማውረድ አልተቻለም" : "Failed to download report",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const canAddStock = user?.role === "health_official" || user?.role === "admin" || user?.role === "system_administrator" || user?.role === "super_admin"

  return (
    <RoleProtected allowedRoles={["admin", "healthcare_worker", "system_administrator", "super_admin", "health_official", "woreda_officer"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("inventory.title", language)}</h1>
            <p className="text-muted-foreground">{t("inventory.subtitle", language)}</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {t("inventory.export", language)}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Excel</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            {/* Nurses can record wastage but not add stock */}
            {user?.role === "healthcare_worker" && (
              <GlobalWastageModal>
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("inventory.recordWastage", language)}
                </Button>
              </GlobalWastageModal>
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
