"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { Search, TrendingUp, TrendingDown, Loader2, Package, History, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { useInventory, type VaccineStock } from "@/lib/inventory-context"
import { WastageModal } from "./wastage-modal"
import { InventoryLogsModal } from "./inventory-logs-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function VaccineStockList() {
  const { language } = useLanguage()
  const { stock, isLoading, refreshStock, pagination } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [selectedVaccine, setSelectedVaccine] = useState<VaccineStock | null>(null)
  const [isLogsOpen, setIsLogsOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refreshStock({ search: searchQuery, status: statusFilter === "all" ? undefined : statusFilter, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    refreshStock({ search: searchQuery, status: statusFilter === "all" ? undefined : statusFilter, page: newPage })
  }

  const handleStatusChange = (val: string) => {
    setStatusFilter(val)
    refreshStock({ search: searchQuery, status: val === "all" ? undefined : val, page: 1 })
  }

  const handleLogs = (vaccine: VaccineStock) => {
    setSelectedVaccine(vaccine)
    setIsLogsOpen(true)
  }

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-foreground">{t("inventory.vaccineStockLevels", language)}</h3>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("inventory.searchVaccines", language)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "am" ? "ሁሉም ሁኔታ" : "All Status"}</SelectItem>
                  <SelectItem value="adequate">{t("inventory.adequate", language)}</SelectItem>
                  <SelectItem value="low">{t("inventory.lowStock", language)}</SelectItem>
                  <SelectItem value="critical">{t("inventory.critical", language)}</SelectItem>
                  <SelectItem value="expired">{language === "am" ? "ጊዜው ያለፈበት" : "Expired"}</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" variant="secondary" className="sm:w-auto">
                {t("dashboard.actions.search", language)}
              </Button>
            </form>
          </div>
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading inventory data...</p>
            </div>
          ) : stock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">No matching inventory found</p>
                <p className="text-sm text-muted-foreground">Adjust filters or add new stock</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("inventory.report.vaccineName", language)}</TableHead>
                    <TableHead>{t("inventory.batchNumber", language)}</TableHead>
                    <TableHead>{t("inventory.quantity", language)}</TableHead>
                    <TableHead>{t("inventory.stockLevel", language)}</TableHead>
                    <TableHead>{t("form.expiryDate", language)}</TableHead>
                    <TableHead className="text-right">{language === "am" ? "ድርጊቶች" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock.map((vaccine) => {
                    const stockPercentage = Math.min((vaccine.quantity / (vaccine.min_stock || 1)) * 100, 100)
                    const isExpired = vaccine.status === "expired"

                    return (
                      <TableRow key={vaccine.id} className={cn(isExpired && "bg-red-50/30 hover:bg-red-50/50")}>
                        <TableCell>
                          <div className="font-medium text-foreground">{vaccine.name}</div>
                          {isExpired && (
                            <Badge variant="destructive" className="mt-1 h-4 text-[9px] px-1 animate-pulse">
                              <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                              EXPIRED
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">
                            {vaccine.batchNumber}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-foreground">
                            {vaccine.quantity} <span className="text-[10px] text-muted-foreground font-normal">vials</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[120px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] mb-0.5">
                              <Badge
                                variant={
                                  vaccine.status === "adequate"
                                    ? "default"
                                    : vaccine.status === "low"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="h-4 text-[8px] uppercase font-bold px-1"
                              >
                                {vaccine.status}
                              </Badge>
                              <span className="font-bold">{stockPercentage.toFixed(0)}%</span>
                            </div>
                            <Progress
                              value={stockPercentage}
                              className={cn(
                                "h-1",
                                vaccine.status === "adequate"
                                  ? "[&>div]:bg-green-500"
                                  : vaccine.status === "low"
                                    ? "[&>div]:bg-orange-500"
                                    : "[&>div]:bg-red-500",
                              )}
                            />
                          </div>
                        </TableCell>
                        <TableCell className={cn("text-xs", isExpired ? "text-red-600 font-medium" : "text-muted-foreground")}>
                          {format(new Date(vaccine.expiryDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleLogs(vaccine)}
                              title="Logs"
                            >
                              <History className="h-3.5 w-3.5" />
                            </Button>
                            <WastageModal vaccine={vaccine}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={vaccine.quantity <= 0}
                                title={t("inventory.recordWastage", language)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </WastageModal>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.lastPage > 1 && (
          <div className="p-6 border-t flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing Page {pagination.currentPage} of {pagination.lastPage}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {selectedVaccine && (
        <InventoryLogsModal
          isOpen={isLogsOpen}
          onClose={() => {
            setIsLogsOpen(false)
            setSelectedVaccine(null)
          }}
          vaccine={selectedVaccine}
        />
      )}
    </>
  )
}
