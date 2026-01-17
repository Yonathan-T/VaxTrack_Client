"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Settings, BarChart3, Users, AlertTriangle } from "lucide-react"
import { getUsers, getCoverageReport } from "@/lib/admin-api"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

interface RoleDashboardProps {
  language: string
}

export function AdminDashboard({ language: initialLanguage }: RoleDashboardProps) {
  const { language } = useLanguage()
  const [stats, setStats] = useState({
    totalUsers: 0,
    systemHealth: "99.8%",
    pendingReports: 3,
    settingsConfigured: true,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, reportRes] = await Promise.all([getUsers(), getCoverageReport()])

        let userCount = 0
        if (usersRes.data && Array.isArray(usersRes.data.users)) {
          userCount = usersRes.data.users.length
        }

        setStats({
          totalUsers: userCount,
          systemHealth: "99.8%",
          pendingReports: 3,
          settingsConfigured: true,
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
        <h2 className="text-2xl font-bold text-foreground mb-2">{t("dashboard.role.admin", language)}</h2>
        <p className="text-muted-foreground">{t("dashboard.role.adminDesc", language)}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.stats.totalUsers", language)}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{isLoading ? "-" : stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.stats.activeUsers", language)}</p>
            </div>
            <Users className="h-10 w-10 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.stats.systemHealth", language)}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.systemHealth}</p>
              <p className="text-xs text-green-600 mt-1">{t("dashboard.stats.uptime", language)}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-secondary opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("reports.defaulters", language)}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.pendingReports}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.stats.toReview", language)}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-accent opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("nav.settings", language)}</p>
              <p className="text-3xl font-bold text-foreground mt-2">All</p>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.stats.allConfigured", language)}</p>
            </div>
            <Settings className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.actions.view", language)}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition">
            <h4 className="font-medium text-foreground">{t("dashboard.actions.userManagement", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">{t("dashboard.role.adminDesc", language)}</p>
          </div>
          <div className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition">
            <h4 className="font-medium text-foreground">{t("dashboard.actions.systemSettings", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">{t("dashboard.role.adminDesc", language)}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
