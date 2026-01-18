"use client"

import { useState, useCallback, useMemo } from "react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { RoleProtected } from "@/lib/role-protected"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Filter, Download, Search, RefreshCw, Clock } from "lucide-react"

interface InventoryLog {
  id: string
  timestamp: string
  action: "add" | "update" | "remove" | "consume"
  vaccine: string
  quantity: number
  previousQuantity?: number
  user: string
  notes?: string
  batchNumber?: string
}

function InventoryLogsContent() {
  const { language } = useLanguage()
  const { user } = useUser()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const initialLogs: InventoryLog[] = [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      action: "add",
      vaccine: "Polio (OPV)",
      quantity: 500,
      user: "John Doe",
      notes: "New shipment received",
      batchNumber: "POLIO-2025-001",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      action: "consume",
      vaccine: "BCG",
      quantity: 150,
      previousQuantity: 300,
      user: "Jane Smith",
      notes: "Daily vaccination sessions",
      batchNumber: "BCG-2024-045",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      action: "update",
      vaccine: "DPT",
      quantity: 400,
      previousQuantity: 450,
      user: "Admin",
      notes: "Inventory adjustment",
      batchNumber: "DPT-2024-089",
    },
  ]

  const [logs, setLogs] = useState<InventoryLog[]>(initialLogs)

  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const newLog: InventoryLog = {
        id: String(Date.now()),
        timestamp: new Date().toISOString(),
        action: "consume",
        vaccine: "Measles",
        quantity: 75,
        previousQuantity: 150,
        user: "Jane Smith",
        notes: "Routine immunization",
        batchNumber: "MEASLES-2025-002",
      }

      setLogs((prevLogs) => [newLog, ...prevLogs])
      const now = new Date()
      setLastUpdated(now)

      toast({
        title: language === "am" ? "ተሳክቷል" : "Refreshed",
        description: language === "am" ? "የእቃ ምግበር ትስስር በተሳካ ሁኔታ ታቅዯ" : "Inventory logs updated successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Refresh failed:", error)
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ሞቅ ደህና ተወደ" : "Refresh failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [language, toast])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.vaccine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterAction === "all" || log.action === filterAction
      return matchesSearch && matchesFilter
    })
  }, [logs, searchTerm, filterAction])

  const handleExportLogs = async () => {
    try {
      const headers = ["Timestamp", "Action", "Vaccine", "Quantity", "Previous Qty", "User", "Batch Number", "Notes"]

      const csvContent = [
        headers.join(","),
        ...filteredLogs.map((log) =>
          [
            `"${new Date(log.timestamp).toLocaleString()}"`,
            `"${getActionLabel(log.action)}"`,
            `"${log.vaccine}"`,
            log.quantity,
            log.previousQuantity || "",
            `"${log.user}"`,
            `"${log.batchNumber || ""}"`,
            `"${log.notes || ""}"`,
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `inventory-logs-${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: language === "am" ? "ተሳክቷል" : "Exported",
        description: language === "am" ? "ሎግ በተሳካ ሁኔታ ላክ ተሠራ" : "Logs exported to Excel successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Export failed:", error)
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ላክ ፈልሰ ተወደ" : "Export failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      add: language === "am" ? "ተጨምሯል" : "Added",
      update: language === "am" ? "ተዘምኗል" : "Updated",
      remove: language === "am" ? "ተወግዷል" : "Removed",
      consume: language === "am" ? "ተጠቅሏል" : "Consumed",
    }
    return labels[action] || action
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      add: "bg-green-100 text-green-800",
      update: "bg-blue-100 text-blue-800",
      remove: "bg-red-100 text-red-800",
      consume: "bg-orange-100 text-orange-800",
    }
    return colors[action] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Activity className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground truncate">
              {language === "am" ? "የእቃ ምግበር ትስስር" : "Inventory Logs"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground px-0 sm:px-0">
            {language === "am"
              ? "የሁሉም የእቃ ምግበር ለውጦች ታሪክ ይመልከቱ"
              : "View complete history of all inventory changes and transactions"}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg min-h-9 sm:min-h-11">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate text-xs sm:text-sm">
            {language === "am" ? "ያለቅ ታቅዶ:" : "Last Updated:"}{" "}
            <span className="font-semibold text-foreground">{lastUpdated.toLocaleString()}</span>
          </span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Search Input */}
          <div className="flex items-center gap-2 sm:gap-3 bg-background rounded-lg border border-input h-9 sm:h-10 md:h-11">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 ml-2 sm:ml-3" />
            <Input
              placeholder={language === "am" ? "ክትባት ወይም ተጠቃሚ ፈልግ..." : "Search vaccine, batch, or user..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-0 text-xs sm:text-sm px-1 sm:px-2"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Filter Dropdown */}
            <div className="flex-1 sm:flex-initial min-w-0 sm:min-w-fit">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-full h-9 sm:h-10 md:h-11 text-xs sm:text-sm bg-background">
                  <Filter className="h-4 w-4 flex-shrink-0" />
                  <SelectValue placeholder="Filter" className="ml-2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "am" ? "ሁሉም" : "All"}</SelectItem>
                  <SelectItem value="add">{language === "am" ? "ተጨምሯል" : "Added"}</SelectItem>
                  <SelectItem value="update">{language === "am" ? "ተዘምኗል" : "Updated"}</SelectItem>
                  <SelectItem value="consume">{language === "am" ? "ተጠቅሏል" : "Consumed"}</SelectItem>
                  <SelectItem value="remove">{language === "am" ? "ተወግዷል" : "Removed"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-9 sm:h-10 md:h-11 text-xs sm:text-sm bg-background text-foreground border hover:bg-muted w-full sm:w-auto"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 flex-shrink-0 ${isLoading ? "animate-spin" : ""}`} />
              <span className="ml-2">{language === "am" ? "ሞቅ ደህና" : "Refresh"}</span>
            </Button>

            {/* Export Button */}
            <Button
              onClick={handleExportLogs}
              className="h-9 sm:h-10 md:h-11 text-xs sm:text-sm bg-background text-foreground border hover:bg-muted w-full sm:w-auto"
              variant="outline"
            >
              <Download className="h-4 w-4 flex-shrink-0" />
              <span className="ml-2">{language === "am" ? "ላክ" : "Export"}</span>
            </Button>
          </div>
        </div>

        <Card className="border">
          <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-4 md:px-6">
            <CardTitle className="text-base sm:text-lg md:text-xl">
              {language === "am" ? "ስርዓተ ሆነታ" : "Transaction History"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {language === "am"
                ? `ጠቅላላ ${filteredLogs.length} ግብረገብ`
                : `Showing ${filteredLogs.length} transaction${filteredLogs.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm">
                      {language === "am" ? "ጊዜ" : "Timestamp"}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm">
                      {language === "am" ? "ክትባት" : "Vaccine"}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm">
                      {language === "am" ? "ንብረት" : "Action"}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm">
                      {language === "am" ? "መጠን" : "Quantity"}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm">
                      {language === "am" ? "ተጠቃሚ" : "User"}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm">
                      {language === "am" ? "ማስታወሻ" : "Notes"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-xs sm:text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-4 text-xs sm:text-sm font-medium">{log.vaccine}</td>
                        <td className="py-3 px-4 text-xs sm:text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}
                          >
                            {getActionLabel(log.action)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs sm:text-sm">
                          <div className="flex flex-col">
                            <span className="font-semibold">{log.quantity}</span>
                            {log.previousQuantity !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                {language === "am" ? "ቀዳሚ:" : "Prev:"} {log.previousQuantity}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs sm:text-sm">{log.user}</td>
                        <td className="py-3 px-4 text-xs sm:text-sm text-muted-foreground max-w-xs truncate">
                          {log.notes || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        {language === "am" ? "ምንም ስርዓተ ሆነታ አልተገኘም" : "No transactions found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile and Tablet Card View */}
            <div className="lg:hidden space-y-2 sm:space-y-3 p-3 sm:p-4">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3 sm:p-4 bg-muted/30 space-y-3">
                    <div className="flex justify-between items-start gap-3 pb-3 border-b">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">{language === "am" ? "ክትባት" : "Vaccine"}</p>
                        <p className="font-semibold text-sm break-words">{log.vaccine}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getActionColor(log.action)}`}
                      >
                        {getActionLabel(log.action)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">{language === "am" ? "መጠን" : "Quantity"}</p>
                        <p className="font-semibold text-sm">{log.quantity}</p>
                        {log.previousQuantity !== undefined && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {language === "am" ? "ቀዳሚ:" : "Prev:"} {log.previousQuantity}
                          </p>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">{language === "am" ? "ተጠቃሚ" : "User"}</p>
                        <p className="font-semibold text-sm break-words">{log.user}</p>
                      </div>
                    </div>

                    {log.batchNumber && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{language === "am" ? "ሊታ ቁጥር" : "Batch #"}</p>
                        <p className="text-xs font-mono break-all">{log.batchNumber}</p>
                      </div>
                    )}

                    {log.notes && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{language === "am" ? "ማስታወሻ" : "Notes"}</p>
                        <p className="text-xs break-words">{log.notes}</p>
                      </div>
                    )}

                    <div className="pt-2 sm:pt-3 border-t">
                      <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {language === "am" ? "ምንም ስርዓተ ሆነታ አልተገኘም" : "No transactions found"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function InventoryLogsPage() {
  return (
    <RoleProtected allowedRoles={["admin", "super_admin"]}>
      <InventoryLogsContent />
    </RoleProtected>
  )
}
