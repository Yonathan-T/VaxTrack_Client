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

export function VaccineStockList() {
  const { language } = useLanguage()
  const { stock, isLoading, refreshStock, pagination } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [selectedVaccine, setSelectedVaccine] = useState<VaccineStock | null>(null)
  const [isWastageOpen, setIsWastageOpen] = useState(false)
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

  const handleWastage = (vaccine: VaccineStock) => {
    setSelectedVaccine(vaccine)
    setIsWastageOpen(true)
  }

  const handleLogs = (vaccine: VaccineStock) => {
    setSelectedVaccine(vaccine)
    setIsLogsOpen(true)
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="adequate">Adequate</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" variant="secondary" className="sm:w-auto">
              Find
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="space-y-3 w-full">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          ) : stock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">No matching inventory found</p>
                <p className="text-sm text-muted-foreground">Adjust filters or add new stock</p>
              </div>
            </div>
          ) : (
            <>
              {stock.map((vaccine) => {
                const stockPercentage = Math.min((vaccine.quantity / vaccine.min_stock) * 100, 100)
                const isExpired = vaccine.status === "expired"

                return (
                  <div key={vaccine.id} className={cn(
                    "border rounded-lg p-3 sm:p-4 space-y-3 transition-colors",
                    isExpired ? "border-red-200 bg-red-50/20" : "border-border hover:border-primary/30"
                  )}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground text-base">{vaccine.name}</h4>
                          <Badge
                            variant={
                              vaccine.status === "adequate"
                                ? "default"
                                : vaccine.status === "low"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-[10px] uppercase font-bold"
                          >
                            {vaccine.status}
                          </Badge>
                          {isExpired && (
                            <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="h-3 w-3" />
                              EXPIRED
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("inventory.batchNumber", language) || "Batch"}</p>
                            <p className="font-medium text-foreground font-mono truncate">{vaccine.batchNumber}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("inventory.quantity", language) || "Stock"}</p>
                            <p className="font-medium text-foreground">
                              {vaccine.quantity} <span className="text-xs text-muted-foreground ml-1">vials</span>
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("form.expiryDate", language) || "Expiry"}</p>
                            <p className={cn(
                              "font-medium",
                              isExpired ? "text-red-600" : "text-foreground"
                            )}>
                              {format(new Date(vaccine.expiryDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Min Stock</p>
                            <p className="font-medium text-foreground">{vaccine.min_stock}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground font-medium">Capacity Used</span>
                            <span className="font-bold text-foreground">{stockPercentage.toFixed(0)}%</span>
                          </div>
                          <Progress
                            value={stockPercentage}
                            className={cn(
                              "h-1.5",
                              vaccine.status === "adequate"
                                ? "[&>div]:bg-green-500"
                                : vaccine.status === "low"
                                  ? "[&>div]:bg-orange-500"
                                  : "[&>div]:bg-red-500",
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleLogs(vaccine)}
                        >
                          <History className="h-3.5 w-3.5 mr-1.5" />
                          Logs
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleWastage(vaccine)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Wastage
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Pagination Controls */}
              {pagination.lastPage > 1 && (
                <div className="flex items-center justify-between pt-6 border-t mt-6">
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
            </>
          )}
        </div>
      </Card>

      {selectedVaccine && (
        <>
          <WastageModal
            isOpen={isWastageOpen}
            onClose={() => {
              setIsWastageOpen(false)
              setSelectedVaccine(null)
            }}
            vaccine={selectedVaccine}
          />
          <InventoryLogsModal
            isOpen={isLogsOpen}
            onClose={() => {
              setIsLogsOpen(false)
              setSelectedVaccine(null)
            }}
            vaccine={selectedVaccine}
          />
        </>
      )}
    </>
  )
}
