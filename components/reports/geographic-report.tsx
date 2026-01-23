"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import type { GeographicData } from "@/lib/admin-api"

const COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
}

interface GeographicReportProps {
  data: GeographicData[]
}

export function GeographicReport({ data }: GeographicReportProps) {
  const { language } = useLanguage()

  // Use the server provided data directly
  // Sort by coverage descending
  const displayData = [...(data || [])].sort((a, b) => b.coverage - a.coverage)

  const highest = displayData[0] || { label: "N/A", coverage: 0 }
  const lowest = displayData[displayData.length - 1] || { label: "N/A", coverage: 0 }
  const totalKids = displayData.reduce((acc, curr) => acc + curr.children, 0)

  const avgCoverage = displayData.length > 0 ?
    Math.round(displayData.reduce((acc, curr) => acc + curr.coverage, 0) / displayData.length) : 0

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t("reports.geographicCoverageAnalysis", language)}</h3>
        <p className="text-sm text-muted-foreground">{t("reports.vaccinationCoverageByKebele", language)}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" className="fill-foreground" fontSize={10} angle={-45} textAnchor="end" height={60} />
              <YAxis className="fill-foreground" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Bar
                dataKey="coverage"
                fill={COLORS.secondary}
                name={t("reports.coverage", language)}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          {displayData.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-2">No geographic data available</p>
          )}
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          <h4 className="font-semibold text-foreground">{t("reports.coverageByArea", language)}</h4>
          {displayData.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {item.children} {t("reports.children", language)}
                  </span>
                  <span className="font-semibold min-w-[50px] text-right text-primary">
                    {item.coverage}%
                  </span>
                </div>
              </div>
              {/* Progress bar always green to show coverage */}
              <Progress
                value={item.coverage}
                className="h-2 [&>div]:bg-emerald-500"
              />
            </div>
          ))}
          {displayData.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No data to display</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-4 gap-4 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-xl font-bold text-emerald-500 truncate">{highest.label}</p>
          <p className="text-sm text-muted-foreground">{t("reports.highestCoverage", language)} ({highest.coverage}%)</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-amber-500 truncate">{lowest.label}</p>
          <p className="text-sm text-muted-foreground">{t("reports.lowestCoverage", language)} ({lowest.coverage}%)</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-primary">{totalKids.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{t("reports.totalChildren", language)}</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-emerald-500">{avgCoverage}%</p>
          <p className="text-sm text-muted-foreground">{t("reports.averageCoverage", language)}</p>
        </div>
      </div>
    </Card>
  )
}
