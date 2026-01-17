"use client"

import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

const COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
}

export function TrendAnalysis() {
  const { language } = useLanguage()
  const [selectedYear, setSelectedYear] = useState("2025")
  const currentYear = new Date().getFullYear()

  // Generate year options from 2023 to current year
  const yearOptions = Array.from({ length: currentYear - 2022 }, (_, i) => (2023 + i).toString())

  const monthlyData = [
    { month: t("calendar.january", language).substring(0, 3), penta1: 720, penta3: 650, measles: 580 },
    { month: t("calendar.february", language).substring(0, 3), penta1: 695, penta3: 625, measles: 560 },
    { month: t("calendar.march", language).substring(0, 3), penta1: 710, penta3: 640, measles: 575 },
    { month: t("calendar.april", language).substring(0, 3), penta1: 685, penta3: 615, measles: 550 },
    { month: t("calendar.may", language).substring(0, 3), penta1: 700, penta3: 630, measles: 565 },
    { month: t("calendar.june", language).substring(0, 3), penta1: 715, penta3: 645, measles: 580 },
    { month: t("calendar.july", language).substring(0, 3), penta1: 690, penta3: 620, measles: 555 },
    { month: t("calendar.august", language).substring(0, 3), penta1: 705, penta3: 635, measles: 570 },
    { month: t("calendar.september", language).substring(0, 3), penta1: 725, penta3: 655, measles: 590 },
    { month: t("calendar.october", language).substring(0, 3), penta1: 710, penta3: 640, measles: 575 },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t("reports.vaccinationTrends", language)}</h3>
          <p className="text-sm text-muted-foreground">{t("reports.monthlyPerformance", language)}</p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="penta1"
            stroke={COLORS.primary}
            strokeWidth={2}
            name={t("vaccine.penta1", language)}
          />
          <Line
            type="monotone"
            dataKey="penta3"
            stroke={COLORS.secondary}
            strokeWidth={2}
            name={t("vaccine.penta3", language)}
          />
          <Line
            type="monotone"
            dataKey="measles"
            stroke={COLORS.accent}
            strokeWidth={2}
            name={t("vaccine.measles1", language)}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="font-semibold text-primary">+2.3%</p>
          <p className="text-muted-foreground">{t("reports.penta1Growth", language)}</p>
        </div>
        <div>
          <p className="font-semibold text-secondary">+1.8%</p>
          <p className="text-muted-foreground">{t("reports.penta3Growth", language)}</p>
        </div>
        <div>
          <p className="font-semibold text-accent">+1.5%</p>
          <p className="text-muted-foreground">{t("reports.measlesGrowth", language)}</p>
        </div>
      </div>
    </Card>
  )
}
