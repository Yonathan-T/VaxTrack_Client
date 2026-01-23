"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, Baby, Syringe, AlertTriangle, ShieldCheck } from "lucide-react"
import { getReportStats, type ReportStats } from "@/lib/admin-api"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"

export function InsightsSection() {
    const { language } = useLanguage()
    const [stats, setStats] = useState<ReportStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const { data, error } = await getReportStats()
                if (!error && data) {
                    setStats(data)
                }
            } catch (err) {
                console.error("Failed to fetch report stats:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    const insights = [
        {
            title: t("reports.totalChildren", language) || "Total Children",
            value: stats?.total_children ?? 0,
            icon: Baby,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
            title: t("reports.totalParents", language) || "Total Parents",
            value: stats?.total_parents ?? 0,
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/30",
        },
        {
            title: t("reports.vaccinesGiven", language) || "Vaccines Given",
            value: stats?.total_vaccines_given ?? 0,
            icon: Syringe,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/30",
        },
        {
            title: t("reports.overdue", language) || "Overdue",
            value: stats?.total_overdue ?? 0,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-100 dark:bg-red-900/30",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.map((insight, index) => {
                const Icon = insight.icon
                return (
                    <Card key={index} className="p-6 flex items-center space-x-4 hover:shadow-md transition-shadow duration-200 border-none bg-card shadow-sm">
                        <div className={cn("p-3 rounded-full", insight.bg)}>
                            <Icon className={cn("h-6 w-6", insight.color)} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{insight.title}</p>
                            <h3 className="text-2xl font-bold text-foreground">
                                {isLoading ? (
                                    <span className="inline-block w-12 h-6 bg-muted animate-pulse rounded" />
                                ) : (
                                    insight.value.toLocaleString()
                                )}
                            </h3>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}
