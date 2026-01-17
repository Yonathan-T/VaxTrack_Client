"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"

const COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  destructive: "#ef4444",
}

export function GeographicReport() {
  const { language } = useLanguage()

  const kebeleData = [
    { kebele: t("location.kebele01", language), coverage: 92.5, children: 1245 },
    { kebele: t("location.kebele02", language), coverage: 88.3, children: 1156 },
    { kebele: t("location.kebele03", language), coverage: 85.7, children: 1089 },
    { kebele: t("location.kebele04", language), coverage: 94.2, children: 1312 },
    { kebele: t("location.kebele05", language), coverage: 90.8, children: 1198 },
    { kebele: t("location.kebele06", language), coverage: 87.4, children: 1067 },
    { kebele: t("location.kebele07", language), coverage: 91.6, children: 1223 },
    { kebele: t("location.kebele08", language), coverage: 89.2, children: 1134 },
  ]

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t("reports.geographicCoverageAnalysis", language)}</h3>
        <p className="text-sm text-muted-foreground">{t("reports.vaccinationCoverageByKebele", language)}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kebeleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="kebele" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="coverage"
                fill={COLORS.primary}
                name={t("reports.coverage", language)}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">{t("reports.coverageByArea", language)}</h4>
          {kebeleData.map((item) => (
            <div key={item.kebele} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item.kebele}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {item.children} {t("reports.children", language)}
                  </span>
                  <span
                    className={cn(
                      "font-semibold min-w-[50px] text-right",
                      item.coverage >= 90 ? "text-secondary" : item.coverage >= 85 ? "text-accent" : "text-destructive",
                    )}
                  >
                    {item.coverage}%
                  </span>
                </div>
              </div>
              <Progress
                value={item.coverage}
                className={cn(
                  "h-2",
                  item.coverage >= 90
                    ? "[&>div]:bg-secondary"
                    : item.coverage >= 85
                      ? "[&>div]:bg-accent"
                      : "[&>div]:bg-destructive",
                )}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-4 gap-4 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-xl font-bold text-secondary">{t("location.kebele04", language)}</p>
          <p className="text-sm text-muted-foreground">{t("reports.highestCoverage", language)} (94.2%)</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-destructive">{t("location.kebele03", language)}</p>
          <p className="text-sm text-muted-foreground">{t("reports.lowestCoverage", language)} (85.7%)</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-primary">9,424</p>
          <p className="text-sm text-muted-foreground">{t("reports.totalChildren", language)}</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-accent">89.7%</p>
          <p className="text-sm text-muted-foreground">{t("reports.averageCoverage", language)}</p>
        </div>
      </div>
    </Card>
  )
}
