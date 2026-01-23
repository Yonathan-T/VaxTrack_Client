"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle, Users, Syringe, Calendar, Stethoscope, CheckCircle2 } from "lucide-react"
import { HealthWorkerInventoryPreview } from "./health-worker-inventory-preview"
import { TodayDueList } from "./today-due-list"
import { useRouter } from "next/navigation"
import { getChildrenList, getAppointmentsList, getStockAlerts, getTodayDue } from "@/lib/healthcare-worker-api"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"

interface RoleDashboardProps {
  language: string
}

export function HealthWorkerDashboard({ language: initialLanguage }: RoleDashboardProps) {
  const router = useRouter()
  const { language } = useLanguage()
  const { user } = useUser()
  const [stats, setStats] = useState({
    childrenRegistered: 0,
    vaccinationsToday: 0,
    upcomingAppointments: 0,
    overdueVaccinations: 0,
    pendingToday: 0,
    childrenThisWeek: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [childrenRes, appointmentsRes, alertsRes, todayDueRes] = await Promise.all([
          getChildrenList(),
          getAppointmentsList({ all: true }),
          getStockAlerts(),
          getTodayDue(),
        ])

        let childrenCount = 0
        let childrenThisWeek = 0
        let appointmentsCount = 0
        let alertsCount = 0
        let vaccinationsToday = 0
        let pendingToday = 0

        if (childrenRes.data) {
          const childrenData = (childrenRes.data as any).children || (childrenRes.data as any).data || childrenRes.data
          const childrenArray = Array.isArray(childrenData) ? childrenData : []
          childrenCount = childrenArray.length

          // Calculate registrations in the last 7 days
          const now = new Date()
          const sevenDaysAgo = new Date(now)
          sevenDaysAgo.setDate(now.getDate() - 7)
          childrenThisWeek = childrenArray.filter((c: any) => {
            const created = (c as any).created_at || (c as any).createdAt
            if (!created) return false
            const createdDate = new Date(created)
            return !isNaN(createdDate.getTime()) && createdDate >= sevenDaysAgo && createdDate <= now
          }).length
        }

        if (appointmentsRes.data) {
          const resData = appointmentsRes.data as any
          const appointmentsArray = Array.isArray(resData?.data)
            ? resData.data
            : Array.isArray(resData?.appointments)
              ? resData.appointments
              : Array.isArray(resData)
                ? resData
                : []

          appointmentsCount = appointmentsArray.filter(
            (a: any) => {
              const status = a.status?.toLowerCase()
              return (status === "scheduled" || status === "pending" || status === "confirmed")
            }
          ).length
        }

        if (alertsRes.data) {
          const alertsData = (alertsRes.data as any).alerts || alertsRes.data
          alertsCount = Array.isArray(alertsData) ? alertsData.length : 0
        }

        if (todayDueRes.data) {
          const data = todayDueRes.data as any
          const todayDueChildren = data.data || []
          vaccinationsToday = todayDueChildren.length

          todayDueChildren.forEach((child: any) => {
            pendingToday += (child.total_pending || 0) - (child.overdue_count || 0)
          })
        }

        setStats({
          childrenRegistered: childrenCount,
          vaccinationsToday,
          upcomingAppointments: appointmentsCount,
          overdueVaccinations: alertsCount,
          pendingToday,
          childrenThisWeek,
        })
      } catch (error) {
        console.error("[v0] Healthcare worker stats fetch error:", error)
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
          {language === "am" ? `እንኳን ደህና መጡ, ${user?.name || "ነርስ"}` : `Welcome, ${user?.name || "Nurse"}`}
        </h1>
        <p className="text-lg text-muted-foreground">
          {language === "am"
            ? "የክትባት አገልግሎት ለልጆች ይስጡ እና የጤና መዝገቦችን ያስተዳድሩ"
            : "Administer vaccinations and manage child health records"}
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            title: t("children.title", language),
            value: stats.childrenRegistered,
            change: `+${stats.childrenThisWeek} ${t("dashboard.thisWeek", language)}`,
            icon: Users,
            color: "text-primary",
            bgGradient: "from-blue-500/10 to-blue-600/5",
            borderColor: "rgb(59 130 246)",
          },
          {
            title: t("dashboard.stats.vaccinationsToday", language),
            value: stats.vaccinationsToday,
            change: `${stats.pendingToday} ${t("vaccinations.stats.pending", language)}`,
            icon: Syringe,
            color: "text-green-600",
            bgGradient: "from-green-500/10 to-green-600/5",
            borderColor: "rgb(34 197 94)",
          },
          {
            title: t("dashboard.stats.upcomingAppointments", language),
            value: stats.upcomingAppointments,
            change: t("vaccinations.stats.nextSevenDays", language),
            icon: Calendar,
            color: "text-purple-600",
            bgGradient: "from-purple-500/10 to-purple-600/5",
            borderColor: "rgb(168 85 247)",
          },
          {
            title: t("vaccinations.stats.overdue", language),
            value: stats.overdueVaccinations,
            change: t("vaccinations.stats.requiresFollowUp", language),
            icon: AlertCircle,
            color: "text-destructive",
            bgGradient: "from-red-500/10 to-red-600/5",
            borderColor: "rgb(239 68 68)",
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
                isLoading ? "animate-pulse" : "animate-fade-in-up"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                borderLeftColor: stat.borderColor,
              }}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
                  stat.bgGradient,
                  isLoading ? "opacity-30" : "opacity-100"
                )}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {isLoading ? (
                        <span className="inline-block w-12 h-8 bg-muted rounded animate-pulse" />
                      ) : (
                        stat.value.toLocaleString()
                      )}
                    </p>
                    <p className={cn("text-xs mt-1", stat.color === "text-destructive" ? "text-red-600" : "text-muted-foreground")}>
                      {stat.change}
                    </p>
                  </div>
                  <Icon className={cn("h-10 w-10", stat.color, "opacity-50 drop-shadow-sm transition-transform duration-500 hover:scale-110 hover:rotate-12")} />
                </div>
              </div>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none opacity-0 hover:opacity-100" />
            </Card>
          )
        })}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.quickActions", language) || "Quick Actions"}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition hover:shadow-md"
            onClick={() => router.push("/dashboard/children/new")}
          >
            <h4 className="font-medium text-foreground">{t("children.registerNewChild", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">{t("children.enterChildGuardianInfo", language)}</p>
          </div>

          <div
            className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition hover:shadow-md"
            onClick={() => router.push("/dashboard/vaccinations/record")}
          >
            <h4 className="font-medium text-foreground">{t("vaccinations.recordVaccination", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {t("vaccinations.startRecordingVaccinations", language)}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <TodayDueList />
        <HealthWorkerInventoryPreview language={language} />
      </div>
    </div>
  )
}
