"use client"

import { useUser } from "@/lib/user-context"
import { useLanguage } from "@/lib/language-context"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { LanguageSwitcher } from "@/components/language-switcher"
import { t } from "@/lib/translations"
import { HealthWorkerDashboard } from "@/components/dashboard/role-dashboard-health-worker"
import { WoaredaDashboard } from "@/components/dashboard/role-dashboard-woreda"
import { AdminDashboard } from "@/components/dashboard/role-dashboard-admin"
import { ParentDashboard } from "@/components/dashboard/role-dashboard-parent"
import { SystemAdministratorDashboard } from "@/components/dashboard/role-dashboard-system-admin"

export default function DashboardPage() {
  const { language } = useLanguage()
  const { user } = useUser()

  const renderRoleDashboard = () => {
    switch (user?.role as any) {
      case "healthcare_worker":
        return <HealthWorkerDashboard language={language} />
      case "health_official":
      case "woreda_officer":
        return <WoaredaDashboard language={language} />
      case "admin":
        return <AdminDashboard language={language} />
      case "system_administrator":
        return <SystemAdministratorDashboard language={language} />
      case "parent":
        return <ParentDashboard language={language} />
      default:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{t("dashboard.title", language)}</h1>
                <p className="text-muted-foreground">{t("dashboard.overview", language)}</p>
              </div>
              <LanguageSwitcher />
            </div>

            <DashboardStats />

            <div className="grid lg:grid-cols-2 gap-6">
              <UpcomingAppointments />
              <RecentActivity />
            </div>
          </div>
        )
    }
  }

  return <div className="space-y-8">{renderRoleDashboard()}</div>
}
