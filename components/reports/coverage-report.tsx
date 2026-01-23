"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { getCoverageReport, type CoverageReportItem } from "@/lib/admin-api"

export function CoverageReport() {
  const { language } = useLanguage()
  const [reportData, setReportData] = useState<CoverageReportItem[] | null>(null)
  const [totalChildren, setTotalChildren] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data, error } = await getCoverageReport()
        if (!error && data) {
          const payload: any = data

          // Case 1: Direct array of CoverageReportItem
          if (Array.isArray(payload)) {
            setReportData(payload)
            if (payload.length > 0 && payload[0].total_children) {
              setTotalChildren(payload[0].total_children)
            }
          }
          // Case 2: Wrapped in { data: [...] }
          else if (Array.isArray(payload?.data)) {
            setReportData(payload.data)
            if (payload.data.length > 0 && payload.data[0].total_children) {
              setTotalChildren(payload.data[0].total_children)
            } else if (payload.total_children) {
              setTotalChildren(payload.total_children)
            }
          }
          // Case 3: Summary object with byVaccine array
          else if (payload.byVaccine) {
            const mapped = payload.byVaccine.map((v: any) => ({
              vaccine: v.vaccineName || v.vaccine,
              code: v.code || v.vaccineName,
              total_given: v.totalGiven || v.total_given || 0,
              coverage_percentage: v.coverage || v.coverage_percentage || 0
            }))
            setReportData(mapped)
            setTotalChildren(payload.totalChildren || payload.total_children || 0)
          }

          // Fallback check for total children in general payload
          if (payload.totalChildren || payload.total_children) {
            setTotalChildren(payload.totalChildren || payload.total_children)
          }
        }
      } catch (err) {
        console.error("[v0] Coverage report fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [])

  const vaccinesToDisplay = reportData || []
  const averageCoverage = vaccinesToDisplay.length > 0
    ? (vaccinesToDisplay.reduce((acc: number, curr: CoverageReportItem) => acc + curr.coverage_percentage, 0) / vaccinesToDisplay.length).toFixed(1)
    : "0"

  const totalVaccinations = vaccinesToDisplay.reduce((acc: number, curr: CoverageReportItem) => acc + curr.total_given, 0)

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">{t("reports.coverageByAntigen", language)}</h3>
        <p className="text-sm text-muted-foreground">
          {language === "am"
            ? `በ ${totalChildren.toLocaleString()} ልጆች ላይ የተመሰረተ`
            : `Based on ${totalChildren.toLocaleString()} registered children`}
        </p>
      </div>

      <div className="space-y-6">
        {vaccinesToDisplay.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground italic">
            {language === "am" ? "መረጃ የለም" : "No coverage data available"}
          </p>
        ) : (
          vaccinesToDisplay.map((item) => (
            <div key={item.code} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item.vaccine}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-xs">
                    {item.total_given.toLocaleString()} {language === "am" ? "ተሰጥቷል" : "given"}
                  </span>
                  <span className="font-semibold min-w-[60px] text-right text-primary">
                    {item.coverage_percentage}%
                  </span>
                </div>
              </div>
              {/* Progress bar always green to show vaccinated percentage */}
              <Progress
                value={item.coverage_percentage}
                className="h-2 [&>div]:bg-emerald-500"
              />
            </div>
          ))
        )}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-500">{averageCoverage}%</p>
          <p className="text-sm text-muted-foreground">{t("reports.averageCoverage", language)}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{totalVaccinations.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{t("reports.totalVaccinations", language)}</p>
        </div>
      </div>
    </Card>
  )
}
