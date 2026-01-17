"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { X } from "lucide-react"

interface ReportFilterProps {
  onClose: () => void
  onApplyFilter: (filters: FilterOptions) => void
}

export interface FilterOptions {
  dateRange: "all" | "month" | "quarter" | "year"
  status: "all" | "completed" | "scheduled" | "overdue"
  facility: string
}

export function ReportFilter({ onClose, onApplyFilter }: ReportFilterProps) {
  const { language } = useLanguage()
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: "all",
    status: "all",
    facility: "",
  })

  const handleApply = () => {
    onApplyFilter(filters)
    onClose()
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{t("reports.filter", language)}</CardTitle>
          <CardDescription>
            {t("reports.filterDescription", language) || "Filter reports by date range, status, and facility"}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("reports.dateRange", language) || "Date Range"}</label>
          <div className="flex gap-2 flex-wrap">
            {["all", "month", "quarter", "year"].map((range) => (
              <Button
                key={range}
                variant={filters.dateRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, dateRange: range as any })}
              >
                {range === "all" ? "All Time" : range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("reports.status", language) || "Status"}</label>
          <div className="flex gap-2 flex-wrap">
            {["all", "completed", "scheduled", "overdue"].map((status) => (
              <Button
                key={status}
                variant={filters.status === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, status: status as any })}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Facility Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("reports.facility", language) || "Facility"}</label>
          <input
            type="text"
            placeholder="Enter facility name"
            value={filters.facility}
            onChange={(e) => setFilters({ ...filters, facility: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleApply} className="flex-1">
            {t("reports.applyFilter", language) || "Apply Filter"}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            {t("reports.cancel", language) || "Cancel"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
