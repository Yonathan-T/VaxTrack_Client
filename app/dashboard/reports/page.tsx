"use client"

import { useEffect, useState } from "react"
import * as XLSX from "xlsx"
import { CoverageReport } from "@/components/reports/coverage-report"
import { TrendAnalysis } from "@/components/reports/trend-analysis"
import { DefaulterReport } from "@/components/reports/defaulter-report"
import { GeographicReport } from "@/components/reports/geographic-report"
import { ReportFilter, type FilterOptions } from "@/components/reports/report-filter"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
import { useVaccinations } from "@/lib/vaccinations-context"
import { useChildren } from "@/lib/children-context"
import { RoleProtected } from "@/lib/role-protected"
import { getCoverageReport } from "@/lib/admin-api"

export default function ReportsPage() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [showFilter, setShowFilter] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(null)
  const { vaccinations } = useVaccinations()
  const { children } = useChildren()
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const { data, error } = await getCoverageReport()
        if (!error && data) {
          setReportData(data)
        }
      } catch (err) {
        console.error("Failed to fetch coverage report:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportData()
  }, [])

  const handleFilter = () => {
    setShowFilter(!showFilter)
  }

  const handleApplyFilter = (filters: FilterOptions) => {
    setActiveFilters(filters)
    toast({
      title: t("reports.filter", language),
      description: `Filters applied: ${filters.dateRange} | ${filters.status}${filters.facility ? ` | ${filters.facility}` : ""}`,
    })
  }

  const handleExport = () => {
    try {
      console.log("[v0] Starting export with XLSX version:", XLSX.version)
      const childrenMap = new Map(children.map((child) => [child.id, child]))

      const vaccinationReportData = vaccinations.map((vac) => {
        const child = childrenMap.get(vac.childId)
        return {
          [t("reports.vaccination.childName", language)]: child?.firstName || "Unknown",
          [t("reports.vaccination.dateOfBirth", language)]: child?.dateOfBirth || "N/A",
          [t("reports.vaccination.vaccine", language)]: vac.vaccine,
          [t("reports.vaccination.vaccinationDate", language)]: vac.date,
          [t("reports.vaccination.batchNumber", language)]: vac.batchNumber,
          [t("reports.vaccination.facility", language)]: vac.facility,
          [t("reports.vaccination.administeredBy", language)]: vac.administeredBy,
          [t("reports.vaccination.status", language)]: vac.status,
          [t("reports.vaccination.nextDue", language)]: vac.nextDue,
        }
      })

      console.log("[v0] Vaccination report data prepared:", vaccinationReportData.length, "records")

      const today = new Date().toISOString().split("T")[0]

      const ws = XLSX.utils.json_to_sheet(vaccinationReportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Vaccination Report")

      // Write to blob and trigger download manually
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([wbout], { type: "application/octet-stream" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `vaccination-report-${language}-${today}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("[v0] Export completed successfully")

      toast({
        title: t("reports.exportReport", language),
        description: `Report exported successfully with ${vaccinationReportData.length} records in ${language === "en" ? "English" : "Amharic"}`,
      })
    } catch (error) {
      console.error("[v0] Export error:", error instanceof Error ? error.message : String(error))
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the report",
        variant: "destructive",
      })
    }
  }

  return (
    <RoleProtected allowedRoles={["woreda_officer", "admin"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("reports.title", language)}</h1>
            <p className="text-muted-foreground">{t("reports.subtitle", language)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant={showFilter ? "default" : "outline"} onClick={handleFilter}>
              <Filter className="h-4 w-4 mr-2" />
              {t("reports.filter", language)}
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t("reports.exportReport", language)}
            </Button>
          </div>
        </div>

        {showFilter && <ReportFilter onClose={() => setShowFilter(false)} onApplyFilter={handleApplyFilter} />}

        {activeFilters && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            Active Filters: {activeFilters.dateRange} | {activeFilters.status}
            {activeFilters.facility && ` | ${activeFilters.facility}`}
          </div>
        )}

        <CoverageReport />

        <div className="grid lg:grid-cols-2 gap-6">
          <TrendAnalysis />
          <DefaulterReport />
        </div>

        <GeographicReport />
      </div>
    </RoleProtected>
  )
}
