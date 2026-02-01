"use client"

import { TrendingUp, Users, AlertCircle, Target, ArrowUpRight, Calendar, Package } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useEffect, useState } from "react"
import { getAnalyticsReport, getCoverageReport } from "@/lib/admin-api"
import { getCampaigns } from "@/lib/official-api"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/user-context"
import { getAllChildrenForAdmin } from "@/lib/admin-api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface RoleDashboardProps {
  language: string
}

export function WoaredaDashboard({ language: initialLanguage }: RoleDashboardProps) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const { user } = useUser()
  const [analytics, setAnalytics] = useState<any>(null)
  const [coverageData, setCoverageData] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any>(null)
  const [totalChildrenCount, setTotalChildrenCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsRes, coverageRes, campaignsRes, childrenRes] = await Promise.all([
          getAnalyticsReport(),
          getCoverageReport(),
          getCampaigns(),
          getAllChildrenForAdmin(),
        ])

        if (analyticsRes.data) setAnalytics(analyticsRes.data)
        if (coverageRes.data) setCoverageData(coverageRes.data)

        // Handle Laravel paginator structure for campaigns
        const campaignData = campaignsRes.data as any
        if (campaignData && (campaignData.success || campaignData.data)) {
          setCampaigns(campaignData.data?.data || campaignData.data || [])
        }

        if (childrenRes.data) {
          const childrenData = (childrenRes.data as any).children || (childrenRes.data as any).data || childrenRes.data
          setTotalChildrenCount(Array.isArray(childrenData) ? childrenData.length : 0)
        }
      } catch (err) {
        console.error("Failed to fetch health official data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const campaignList = Array.isArray(campaigns) ? campaigns : []
  const activeCount = campaignList.filter((c: any) => c.status?.toLowerCase() === "active").length
  const completedCount = campaignList.filter((c: any) => c.status?.toLowerCase() === "completed").length

  const vaccines = Array.isArray(coverageData) ? coverageData : []
  const coveragePercent = vaccines.length > 0
    ? vaccines.reduce((sum, v) => sum + (v.coverage_percentage || 0), 0) / vaccines.length
    : 0

  const totalChildren = totalChildrenCount
  const totalOverdue = analytics?.defaulters?.length || 0

  const cards = [
    {
      title: t("dashboard.stats.totalChildren", language),
      value: totalChildren.toLocaleString(),
      change: "Real-time",
      trend: "neutral",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100/50 dark:bg-blue-900/20",
      borderColor: "rgb(59 130 246)",
      bgGradient: "from-blue-500/10 to-blue-600/5",
    },
    {
      title: t("reports.coverage", language),
      value: coveragePercent.toFixed(1) + "%",
      change: "Calculated",
      trend: "up",
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-100/50 dark:bg-emerald-900/20",
      borderColor: "rgb(16 185 129)",
      bgGradient: "from-emerald-500/10 to-emerald-600/5",
    },
    {
      title: t("vaccinations.stats.overdue", language),
      value: totalOverdue.toLocaleString(),
      change: "Action required",
      trend: "down",
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-100/50 dark:bg-rose-900/20",
      borderColor: "rgb(225 29 72)",
      bgGradient: "from-rose-500/10 to-rose-600/5",
    },
    {
      title: t("dashboard.nav.campaigns", language),
      value: `${activeCount} Active`,
      change: campaignList.length > 0 ? `${completedCount} completed of ${campaignList.length} total` : "No campaigns",
      trend: "neutral",
      icon: Calendar,
      color: "text-amber-600",
      bg: "bg-amber-100/50 dark:bg-amber-900/20",
      borderColor: "rgb(245 158 11)",
      bgGradient: "from-amber-500/10 to-amber-600/5",
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {language === "am" ? `እንኳን ደህና መጡ, ${user?.name || "ባለስልጣን"}` : `Hey, ${user?.name || "Official"}`}
          </h1>
          <p className="text-lg text-muted-foreground">{t("dashboard.role.woredaDesc", language)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))
        ) : (
          cards.map((card, i) => (
            <Card
              key={i}
              className={cn(
                "p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1 border-l-4",
                isLoading ? "animate-pulse" : "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{
                animationDelay: `${i * 100}ms`,
                borderLeftColor: card.borderColor
              }}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-opacity duration-700 opacity-100",
                  card.bgGradient
                )}
              />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={cn(
                      "text-xs font-medium flex items-center",
                      card.trend === "up" ? "text-emerald-600" : card.trend === "down" ? "text-rose-600" : "text-amber-600"
                    )}>
                      {card.change}
                      <ArrowUpRight className={cn("h-3 w-3 ml-0.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5", card.trend === "down" && "rotate-90")} />
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">{t("dashboard.thisMonth", language)}</span>
                  </div>
                </div>
                <div className={cn("p-3 rounded-xl transition-all duration-300 group-hover:scale-110", card.bg)}>
                  <card.icon className={cn("h-6 w-6 transition-transform duration-500 group-hover:rotate-12", card.color)} />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700">
                <card.icon className="h-24 w-24" />
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">{t("dashboard.quickActions", language)}</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/campaigns">
            <div className="flex items-start gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors group h-full">
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">{t("dashboard.nav.campaigns", language)}</h4>
                <p className="text-sm text-muted-foreground">Launch or monitor vaccination campaigns</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/facilities">
            <div className="flex items-start gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors group h-full">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">{t("dashboard.nav.facilities", language)}</h4>
                <p className="text-sm text-muted-foreground">Manage healthcare facilities in your sub-city</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/reports">
            <div className="flex items-start gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors group h-full">
              <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">{t("dashboard.nav.reports", language)}</h4>
                <p className="text-sm text-muted-foreground">View detailed health metrics</p>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  )
}
