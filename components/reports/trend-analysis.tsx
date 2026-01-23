"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import type { TrendData } from "@/lib/admin-api"

const COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  bcg: "#8b5cf6",
  tt: "#ec4899",
  pcv: "#06b6d4",
  rota: "#f97316",
}

interface TrendAnalysisProps {
  data: TrendData[]
}

export function TrendAnalysis({ data }: TrendAnalysisProps) {
  const { language } = useLanguage()
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [vaccineGroup, setVaccineGroup] = useState<string>("all")
  const currentYear = new Date().getFullYear()

  // Generate year options
  const yearOptions = Array.from({ length: currentYear - 2022 }, (_, i) => (2023 + i).toString())

  const vaccineKeys = [
    "bcg", "opv0", "penta1", "pcv1", "rota1", "opv1",
    "penta2", "pcv2", "rota2", "opv2", "penta3", "pcv3",
    "opv3", "ipv", "measles1", "measles2",
    "tt1", "tt2", "tt3", "tt4", "tt5"
  ]

  // Define vaccine groups and their granular keys
  const groups = {
    bcg: ["bcg"],
    penta: ["penta1", "penta2", "penta3"],
    measles: ["measles1", "measles2"],
    polio: ["opv0", "opv1", "opv2", "opv3", "ipv"],
    tt: ["tt1", "tt2", "tt3", "tt4", "tt5"],
    pcv: ["pcv1", "pcv2", "pcv3"],
    rota: ["rota1", "rota2"],
  }

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return Array.from({ length: 6 }, (_, i) => ({
        name: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i],
        month: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i],
        bcg: 0, penta: 0, measles: 0, polio: 0, tt: 0, pcv: 0, rota: 0,
        ...vaccineKeys.reduce((acc, k) => ({ ...acc, [k]: 0 }), {})
      })) as any[]
    }

    return data.map(item => {
      // Aggregate for "all" view
      const aggregated: any = {
        bcg: Number(item.bcg) || 0,
        penta: (Number(item.penta1) || 0) + (Number(item.penta2) || 0) + (Number(item.penta3) || 0),
        measles: (Number(item.measles1) || 0) + (Number(item.measles2) || 0),
        polio: (Number(item.opv0) || 0) + (Number(item.opv1) || 0) + (Number(item.opv2) || 0) + (Number(item.opv3) || 0) + (Number(item.ipv) || 0),
        tt: (Number(item.tt1) || 0) + (Number(item.tt2) || 0) + (Number(item.tt3) || 0) + (Number(item.tt4) || 0) + (Number(item.tt5) || 0),
        pcv: (Number(item.pcv1) || 0) + (Number(item.pcv2) || 0) + (Number(item.pcv3) || 0),
        rota: (Number(item.rota1) || 0) + (Number(item.rota2) || 0),
      }

      // Convert all original keys to numbers where possible
      const processedItem: any = { ...item }
      Object.keys(item).forEach(key => {
        if (key !== 'month' && key !== 'name') {
          const val = Number(item[key])
          processedItem[key] = isNaN(val) ? 0 : val
        }
      })

      return {
        ...processedItem,
        name: item.month,
        ...aggregated
      }
    })
  }, [data])

  const hasAnyRecords = useMemo(() => {
    if (!data || data.length === 0) return false
    return data.some(m =>
      vaccineKeys.some(key => {
        const val = Number(m[key])
        return !isNaN(val) && val > 0
      })
    )
  }, [data])

  const calculateGrowth = (groupKey: keyof typeof groups) => {
    if (!chartData || chartData.length < 2) return "+0%"
    const lastIdx = chartData.length - 1
    const current = (chartData[lastIdx][groupKey] as number) || 0
    const previous = (chartData[lastIdx - 1][groupKey] as number) || 0
    if (previous === 0) return current > 0 ? "+100%" : "+0%"
    const growth = ((current - previous) / previous) * 100
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`
  }

  // Get lines to render based on selection - returning array instead of fragment for Recharts compatibility
  const renderLines = () => {
    if (vaccineGroup === "all") {
      return [
        <Line key="bcg" type="monotone" dataKey="bcg" stroke={COLORS.bcg} strokeWidth={2} name={t("vaccine.bcg", language)} dot={{ r: 4 }} activeDot={{ r: 6 }} />,
        <Line key="penta" type="monotone" dataKey="penta" stroke={COLORS.primary} strokeWidth={2} name={t("reports.group.penta", language)} dot={{ r: 4 }} activeDot={{ r: 6 }} />,
        <Line key="measles" type="monotone" dataKey="measles" stroke={COLORS.accent} strokeWidth={2} name={t("reports.group.measles", language)} dot={{ r: 4 }} activeDot={{ r: 6 }} />,
        <Line key="polio" type="monotone" dataKey="polio" stroke={COLORS.secondary} strokeWidth={2} name={t("reports.group.polio", language)} dot={{ r: 4 }} activeDot={{ r: 6 }} />,
        <Line key="tt" type="monotone" dataKey="tt" stroke={COLORS.tt} strokeWidth={2} name={t("reports.group.tt", language)} dot={{ r: 4 }} activeDot={{ r: 6 }} />,
        <Line key="pcv" type="monotone" dataKey="pcv" stroke={COLORS.pcv} strokeWidth={2} name={t("reports.group.pcv", language)} dot={{ r: 4 }} activeDot={{ r: 6 }} />,
        <Line key="rota" type="monotone" dataKey="rota" stroke={COLORS.rota} strokeWidth={2} name={t("reports.group.rota", language)} dot={{ r: 4 }} activeDot={{ r: 6 }} />,
      ]
    }

    const subgroupKeys = groups[vaccineGroup as keyof typeof groups] || []
    return subgroupKeys.map((key, index) => (
      <Line
        key={key}
        type="monotone"
        dataKey={key}
        stroke={[COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.bcg, COLORS.tt, COLORS.pcv, COLORS.rota][index % 7]}
        strokeWidth={2}
        name={t(`vaccine.${key}` as any, language)}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    ))
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t("reports.vaccinationTrends", language)}</h3>
          <p className="text-sm text-muted-foreground">{t("reports.monthlyPerformance", language)}</p>
        </div>
        <div className="flex gap-2">
          <Select value={vaccineGroup} onValueChange={setVaccineGroup}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("reports.allVaccines", language)}</SelectItem>
              <SelectItem value="bcg">{t("reports.group.bcg", language)}</SelectItem>
              <SelectItem value="penta">{t("reports.group.penta", language)}</SelectItem>
              <SelectItem value="pcv">{t("reports.group.pcv", language)}</SelectItem>
              <SelectItem value="rota">{t("reports.group.rota", language)}</SelectItem>
              <SelectItem value="polio">{t("reports.group.polio", language)}</SelectItem>
              <SelectItem value="measles">{t("reports.group.measles", language)}</SelectItem>
              <SelectItem value="tt">{t("reports.group.tt", language)}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28">
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
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#6b7280" fontSize={12} dy={10} />
            <YAxis axisLine={false} tickLine={false} stroke="#6b7280" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            {renderLines()}
          </LineChart>
        </ResponsiveContainer>

        {!hasAnyRecords && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
            <p className="text-sm font-medium text-muted-foreground bg-background px-4 py-2 rounded-full border border-border shadow-sm">
              No vaccination data found for this period
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center text-sm">
        {(Object.keys(groups) as Array<keyof typeof groups>).map(group => (
          <div key={group} className={vaccineGroup !== 'all' && vaccineGroup !== group ? 'opacity-40 transition-opacity' : 'transition-opacity'}>
            <p className={`font-semibold ${group === 'bcg' ? 'text-purple-600' :
                group === 'penta' ? 'text-blue-600' :
                  group === 'measles' ? 'text-amber-600' :
                    group === 'polio' ? 'text-emerald-600' :
                      group === 'tt' ? 'text-pink-600' :
                        group === 'pcv' ? 'text-cyan-600' : 'text-orange-600'
              }`}>{calculateGrowth(group)}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t(`reports.group.${group}` as any, language)}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
