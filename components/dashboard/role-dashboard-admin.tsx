"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Activity, ShieldCheck, Users, Baby, Syringe, Package, ArrowUpRight } from "lucide-react"
import { getAdminDbCheck, getAdminSystemStatus, getAllChildrenForAdmin, getUsers, getAnalyticsReport } from "@/lib/admin-api"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useUser } from "@/lib/user-context"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface RoleDashboardProps {
  language: string
}

export function AdminDashboard({ language: initialLanguage }: RoleDashboardProps) {
  const { language } = useLanguage()
  const { user } = useUser()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    systemHealthStatus: "Unknown" as "Healthy" | "Degraded" | "Unknown",
    systemHealthDetail: "" as string,
    totalChildren: 0,
    childrenRegisteredThisWeek: 0,
    vaccinationsGivenThisWeek: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showHealthDetails, setShowHealthDetails] = useState(false)
  const [dbPayload, setDbPayload] = useState<any>(null)
  const [statusPayload, setStatusPayload] = useState<any>(null)
  const [statusLatencyMs, setStatusLatencyMs] = useState<number | null>(null)
  const [showStatusPayload, setShowStatusPayload] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)

  const getStatusColor = (status?: string) => {
    if (!status) return "text-muted-foreground"
    const normalized = status.toLowerCase()
    if (normalized.includes("connect") || normalized.includes("ok") || normalized.includes("healthy")) {
      return "text-green-600"
    }
    if (normalized.includes("degrad") || normalized.includes("warn")) return "text-amber-600"
    return "text-destructive"
  }

  const renderStatusPill = (status?: string, label?: string) => {
    const normalized = (status || "").toLowerCase()
    const color =
      normalized.includes("connect") || normalized.includes("ok") || normalized.includes("healthy")
        ? "bg-green-600"
        : normalized.includes("degrad") || normalized.includes("warn")
          ? "bg-amber-500"
          : "bg-red-500"
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-foreground">
        <span className={cn("h-2 w-2 rounded-full", color)} />
        {label || status || "Status"}
      </span>
    )
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, childrenRes, dbRes, analyticsRes] = await Promise.all([
          getUsers(),
          getAllChildrenForAdmin(),
          getAdminDbCheck(),
          getAnalyticsReport(),
        ])

        if (analyticsRes.data) setAnalytics(analyticsRes.data)

        // Measure /v1/admin/status latency separately
        const start = typeof performance !== "undefined" ? performance.now() : Date.now()
        const statusRes = await getAdminSystemStatus()
        const end = typeof performance !== "undefined" ? performance.now() : Date.now()
        setStatusLatencyMs(Math.round(end - start))
        setStatusPayload(statusRes.data)

        let userCount = 0
        const usersPayload: any = usersRes.data
        const usersArray =
          (Array.isArray(usersPayload?.users) && usersPayload.users) ||
          (Array.isArray(usersPayload?.data?.data) && usersPayload.data.data) ||
          (Array.isArray(usersPayload?.data) && usersPayload.data) ||
          []
        userCount = usersArray.length

        const now = new Date()
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(now.getDate() - 7)

        const childrenData = (childrenRes.data as any)?.children || (childrenRes.data as any)?.data || childrenRes.data
        const childrenArray = Array.isArray(childrenData) ? childrenData : (childrenData?.data && Array.isArray(childrenData.data) ? childrenData.data : [])

        const childrenThisWeek = childrenArray.filter((c: any) => {
          const created = c?.created_at || c?.createdAt
          if (!created) return false
          const createdDate = new Date(created)
          return !isNaN(createdDate.getTime()) && createdDate >= sevenDaysAgo && createdDate <= now
        }).length

        // Vaccinations given this week: count administered records within last 7 days (best effort).
        let vaccinationsThisWeek = 0
        childrenArray.forEach((c: any) => {
          const records = c?.vaccination_records || c?.vaccinationRecords || []
          if (!Array.isArray(records)) return
          records.forEach((r: any) => {
            const administered = r?.date_administered || r?.dateAdministered
            if (!administered) return
            const d = new Date(administered)
            if (!isNaN(d.getTime()) && d >= sevenDaysAgo && d <= now) vaccinationsThisWeek += 1
          })
        })

        // System health: DB check + detailed status endpoint (500 means issues).
        const db = dbRes.data
        const dbConnected = !!db && String((db as any).status || "").toLowerCase().includes("connect")
        setDbPayload(dbRes.data)

        const statusData = statusRes.data
        const statusHasIssues = Array.isArray((statusData as any)?.issues) && (statusData as any).issues.length > 0
        const statusErrored = !!statusRes.error || statusRes.status >= 500

        const systemHealthStatus: "Healthy" | "Degraded" | "Unknown" =
          dbConnected && !statusHasIssues && !statusErrored ? "Healthy" : statusErrored || statusHasIssues ? "Degraded" : "Unknown"

        const issuesPreview =
          statusHasIssues
            ? (statusData as any).issues
              .slice(0, 2)
              .map((i: any) => i?.message || i?.service || "Issue detected")
              .filter(Boolean)
              .join(" • ")
            : ""

        const systemHealthDetail = systemHealthStatus === "Healthy"
          ? `${db?.database || "Database"} connected`
          : issuesPreview || (dbConnected ? "Service issues detected" : "Database connection issue")

        setStats({
          totalUsers: userCount,
          systemHealthStatus,
          systemHealthDetail,
          totalChildren: childrenArray.length,
          childrenRegisteredThisWeek: childrenThisWeek,
          vaccinationsGivenThisWeek: vaccinationsThisWeek,
        })

      } catch (error) {
        console.error("Failed to fetch admin stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          {language === "am" ? `እንኳን ደህና መጡ, ${user?.name || "አስተዳዳሪ"}` : `Hello, ${user?.name || "Admin"}`}
        </h1>
        <p className="text-lg text-muted-foreground">
          {language === "am"
            ? "የተጠቃሚ አካውንቶችን፣ ሪፖርቶችን እና የስርዓት ጤናን በአንድ ቦታ ይቆጣጠሩ"
            : "Run the program like a real product: monitor health, users, and weekly progress."}
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            title: "Total users",
            value: stats.totalUsers,
            change: "Accounts across all roles",
            icon: Users,
            color: "text-primary",
            bgGradient: "from-blue-500/10 to-blue-600/5",
            borderColor: "rgb(59 130 246)",
          },
          {
            title: "System health",
            value: renderStatusPill(stats.systemHealthStatus, stats.systemHealthStatus),
            change: stats.systemHealthDetail || "Live status",
            icon: ShieldCheck,
            color: stats.systemHealthStatus === "Healthy" ? "text-green-600" : stats.systemHealthStatus === "Degraded" ? "text-destructive" : "text-secondary",
            bgGradient: stats.systemHealthStatus === "Healthy" ? "from-green-500/10 to-green-600/5" : "from-red-500/10 to-red-600/5",
            borderColor: stats.systemHealthStatus === "Healthy" ? "rgb(34 197 94)" : "rgb(239 68 68)",
            onClick: () => setShowHealthDetails((v) => !v),
            isInteractive: true,
          },
          {
            title: "Total Children",
            value: stats.totalChildren,
            change: "All registered records",
            icon: Baby,
            color: "text-purple-600",
            bgGradient: "from-purple-500/10 to-purple-600/5",
            borderColor: "rgb(168 85 247)",
          },
          {
            title: "Vaccinations given this week",
            value: stats.vaccinationsGivenThisWeek,
            change: "Administered doses in the last 7 days",
            icon: Syringe,
            color: "text-secondary",
            bgGradient: "from-amber-500/10 to-amber-600/5",
            borderColor: "rgb(245 158 11)",
          },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className={cn(
                "p-6 relative overflow-hidden",
                "transition-all duration-500 ease-out",
                "hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1",
                "border-l-4",
                isLoading ? "animate-pulse" : "animate-fade-in-up",
                stat.isInteractive && "cursor-pointer",
              )}
              onClick={stat.onClick}
              style={{
                animationDelay: `${index * 100}ms`,
                borderLeftColor: stat.borderColor,
              }}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
                  stat.bgGradient,
                  isLoading ? "opacity-30" : "opacity-100",
                )}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{stat.title}</p>
                    <div className="text-3xl font-bold text-foreground mt-2">
                      {isLoading ? (
                        <span className="inline-block w-12 h-8 bg-muted rounded animate-pulse" />
                      ) : typeof stat.value === "number" ? (
                        stat.value.toLocaleString()
                      ) : (
                        stat.value
                      )}
                    </div>
                    <p className={cn("text-xs mt-1", stat.color === "text-destructive" ? "text-red-600" : "text-muted-foreground")}>
                      {stat.change}
                    </p>
                  </div>
                  <Icon className={cn("h-10 w-10", stat.color, "opacity-50 drop-shadow-sm transition-transform duration-500 hover:scale-110 hover:rotate-12")} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {showHealthDetails && (
        <Card className="p-6 border-primary/30 bg-muted/40">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">System health details</h3>
              <p className="text-sm text-muted-foreground">Payload from /v1/admin/db-check and /v1/admin/status</p>
            </div>
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => setShowHealthDetails(false)}
            >
              Hide
            </button>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-background">
              <p className="text-xs text-muted-foreground">Database</p>
              <p className="text-base font-semibold mt-1">{isLoading ? "-" : (dbPayload?.database || "Database")}</p>
              <p className={cn("text-sm mt-1 font-medium", getStatusColor(isLoading ? undefined : dbPayload?.status || stats.systemHealthStatus))}>
                {isLoading ? "Loading..." : renderStatusPill(dbPayload?.status || stats.systemHealthStatus, dbPayload?.status || stats.systemHealthStatus)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Host: {isLoading ? "-" : dbPayload?.host || "n/a"}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-background">
              <p className="text-xs text-muted-foreground">Raw response</p>
              <pre className="text-xs mt-2 whitespace-pre-wrap break-all text-foreground">
                {isLoading ? "Loading..." : JSON.stringify(dbPayload || { status: stats.systemHealthStatus, detail: stats.systemHealthDetail }, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      )}


      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.quickActions", language)}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition hover:shadow-md"
            onClick={() => router.push("/dashboard/children")}
          >
            <h4 className="font-medium text-foreground">{t("dashboard.nav.children", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "am" ? "ልጆችን ይፈልጉ፣ ይመዝግቡ እና መዝገቦቻቸውን ይመልከቱ" : "View and manage registered children across facilities."}
            </p>
          </div>
          <div
            className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition hover:shadow-md"
            onClick={() => router.push("/dashboard/vaccinations")}
          >
            <h4 className="font-medium text-foreground">{t("dashboard.nav.vaccinations", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "am" ? "የክትባት እቅዶችን እና መመዝገቦችን ይከታተሉ" : "Track vaccination activity and performance."}
            </p>
          </div>
          <div
            className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition hover:shadow-md"
            onClick={() => router.push("/dashboard/appointments")}
          >
            <h4 className="font-medium text-foreground">{t("dashboard.nav.appointments", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "am" ? "ቀጠሮዎችን ይመልከቱ እና ያስተዳድሩ" : "Review scheduled visits and upcoming demand."}
            </p>
          </div>
          <div
            className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition hover:shadow-md"
            onClick={() => router.push("/dashboard/reports")}
          >
            <h4 className="font-medium text-foreground">{t("dashboard.nav.reports", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "am" ? "ሽፋን ሪፖርቶችን ይመልከቱ እና ውሳኔ ይውሰኑ" : "Open coverage and performance reports."}
            </p>
          </div>
        </div>
      </Card>

      <Card className={cn("p-6", stats.systemHealthStatus === "Healthy" ? "border-green-500/20" : "border-red-500/20")}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground">
              {language === "am" ? "የስርዓት ጤና" : "System Health"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "am"
                ? "DB ግንኙነት እና የአገልግሎት ጥንካሬ ሁኔታ"
                : "Database connectivity and service checks (DB/cache/queue)."}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setShowHealthDetails((v) => !v)}
            >
              {showHealthDetails ? "Hide details" : "View details"}
            </button>
            <Activity
              className={cn("h-6 w-6", stats.systemHealthStatus === "Healthy" ? "text-green-600" : "text-destructive")}
            />
          </div>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">{language === "am" ? "ሁኔታ" : "Status"}</p>
            <div className="flex items-center gap-2 mt-1">
              {isLoading ? (
                <span className="inline-block w-12 h-4 bg-muted rounded animate-pulse" />
              ) : (
                renderStatusPill(stats.systemHealthStatus, stats.systemHealthStatus)
              )}
              {!isLoading && statusLatencyMs != null && (
                <span className="text-xs text-muted-foreground">{statusLatencyMs} ms</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading
                ? ""
                : stats.systemHealthStatus === "Healthy"
                  ? "All systems are operational."
                  : stats.systemHealthDetail}
            </p>
            <button
              type="button"
              className="mt-2 text-xs text-primary hover:underline"
              onClick={() => setShowStatusPayload((v) => !v)}
            >
              {showStatusPayload ? "Hide /status payload" : "View /status payload"}
            </button>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">{language === "am" ? "DB ማረጋገጫ" : "DB Check"}</p>
            <p className="text-base font-semibold mt-1">{isLoading ? "-" : "Live"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {language === "am" ? "ከ `/v1/admin/db-check` እና `/v1/admin/status` የተገኘ" : "From `/v1/admin/db-check` and `/v1/admin/status`."}
            </p>
          </div>
        </div>

        {showStatusPayload && (
          <div className="mt-4 p-3 rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">/v1/admin/status payload</span>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => setShowStatusPayload(false)}
              >
                Close
              </button>
            </div>
            <pre className="text-xs whitespace-pre-wrap break-all text-foreground">
              {isLoading ? "Loading..." : JSON.stringify(statusPayload, null, 2)}
            </pre>
          </div>
        )}
      </Card>

    </div>
  )
}
