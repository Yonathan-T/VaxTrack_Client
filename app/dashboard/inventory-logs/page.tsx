"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/lib/language-context"
import { RoleProtected } from "@/lib/role-protected"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Filter, Download, Search, RefreshCw, Clock, ChevronLeft, ChevronRight, Loader2, FileText, FileSpreadsheet, ChevronDown } from "lucide-react"
import { inventoryApi, type InventoryLog } from "@/lib/inventory-api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"

function InventoryLogsContent() {
  const { language } = useLanguage()
  const { toast } = useToast()

  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  })

  const [filterType, setFilterType] = useState<string>("all")
  const [batchSearch, setBatchSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isExporting, setIsExporting] = useState(false)

  const fetchLogs = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await inventoryApi.globalLogs({
        page,
        type: filterType === "all" ? undefined : filterType,
        batch_number: batchSearch || undefined,
        per_page: 15
      })

      if (response.data) {
        // If data is at response.data.data because of apiClient extraction
        const logData = (response.data as any).data || response.data
        setLogs(Array.isArray(logData) ? logData : [])

        setPagination({
          currentPage: (response.data as any).current_page || 1,
          lastPage: (response.data as any).last_page || 1,
          total: (response.data as any).total || 0
        })
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("[InventoryLogs] Fetch failed:", error)
      toast({
        title: "Error",
        description: "Failed to load inventory logs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [filterType, batchSearch, toast])

  useEffect(() => {
    fetchLogs(1)
  }, [fetchLogs])

  const handleExportLogs = async (format: "pdf" | "csv") => {
    setIsExporting(true)
    try {
      toast({
        title: language === "am" ? "ወደ ውጭ በመላክ ላይ..." : "Exporting...",
        description: language === "am" ? "ሪፖርቱን እያዘጋጀን ነው..." : "Preparing your report...",
      })

      const result = await inventoryApi.downloadInventoryLogsReport(format)
      
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
      link.download = `inventory-logs.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: language === "am" ? "ተሳክቷል" : "Success",
        description: language === "am" ? "ሪፖርቱ በተሳካ ሁኔታ ወርዷል" : "Report downloaded successfully",
      })
    } catch (error) {
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ሪፖርቱን ማውረድ አልተቻለም" : "Failed to download report",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getActionLabel = (type: string) => {
    const labels: Record<string, string> = {
      receipt: "Receipt",
      wastage: "Wastage",
      dispense: "Dispensed",
      adjustment: "Adjustment",
      add: "Added",
      consume: "Consumed"
    }
    return labels[type] || type
  }

  const getActionColor = (type: string) => {
    const colors: Record<string, string> = {
      receipt: "bg-green-100 text-green-800",
      add: "bg-green-100 text-green-800",
      wastage: "bg-red-100 text-red-800",
      dispense: "bg-blue-100 text-blue-800",
      consume: "bg-orange-100 text-orange-800",
      adjustment: "bg-gray-100 text-gray-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="w-full min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Inventory Logs</h1>
            </div>
            <p className="text-muted-foreground">Complete history of all inventory transactions</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>Last Updated: <span className="font-semibold">{format(lastUpdated, "HH:mm:ss")}</span></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by batch number..."
              value={batchSearch}
              onChange={(e) => setBatchSearch(e.target.value)}
              className="pl-9 h-11"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-11">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="receipt">Receipts</SelectItem>
              <SelectItem value="wastage">Wastage</SelectItem>
              <SelectItem value="dispense">Dispensed</SelectItem>
              <SelectItem value="adjustment">Adjustments</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-11" onClick={() => fetchLogs(1)}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 h-11" disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExportLogs("csv")}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportLogs("pdf")}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Showing {logs.length} of {pagination.total} total logs
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold">Vaccine & Batch</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                    <th className="text-left py-3 px-4 font-semibold">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold">User</th>
                    <th className="text-left py-3 px-4 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading logs...</p>
                      </td>
                    </tr>
                  ) : logs.length > 0 ? (
                    logs.map((log: any) => (
                      <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          {format(new Date(log.created_at), "MMM d, HH:mm")}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-foreground">
                            {log.inventory_item?.vaccine?.name || "Unknown Vaccine"}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {log.batch_number || "No Batch"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", getActionColor(log.type || log.action))}>
                            {getActionLabel(log.type || log.action)}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold">
                          <span className={log.quantity > 0 ? "text-green-600" : "text-red-600"}>
                            {log.quantity > 0 ? "+" : ""}{log.quantity}
                          </span>
                        </td>
                        <td className="py-4 px-4">{log.user?.name || "System"}</td>
                        <td className="py-4 px-4 text-muted-foreground max-w-xs truncate">
                          {log.notes || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.lastPage > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.lastPage}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.lastPage || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function InventoryLogsPage() {
  return (
    <RoleProtected allowedRoles={["admin", "system_administrator", "super_admin", "healthcare_worker", "health_official", "woreda_officer"]}>
      <InventoryLogsContent />
    </RoleProtected>
  )
}
