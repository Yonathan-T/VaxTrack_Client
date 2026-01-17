"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Users, AlertCircle, Target } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

interface RoleDashboardProps {
  language: string
}

export function WoaredaDashboard({ language: initialLanguage }: RoleDashboardProps) {
  const { language } = useLanguage()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t("dashboard.role.woreda", language)}</h2>
        <p className="text-muted-foreground">{t("dashboard.role.woredaDesc", language)}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.stats.totalChildren", language)}</p>
              <p className="text-3xl font-bold text-foreground mt-2">892</p>
              <p className="text-xs text-green-600 mt-1">+156 {t("dashboard.thisMonth", language)}</p>
            </div>
            <Users className="h-10 w-10 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("reports.coverage", language)}</p>
              <p className="text-3xl font-bold text-foreground mt-2">87%</p>
              <p className="text-xs text-green-600 mt-1">+5% from last month</p>
            </div>
            <Target className="h-10 w-10 text-secondary opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("vaccinations.stats.overdue", language)}</p>
              <p className="text-3xl font-bold text-foreground mt-2">42</p>
              <p className="text-xs text-muted-foreground mt-1">{t("vaccinations.stats.requiresFollowUp", language)}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-accent opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.performance", language)}</p>
              <p className="text-3xl font-bold text-foreground mt-2">94%</p>
              <p className="text-xs text-green-600 mt-1">{t("dashboard.stats.aboveTarget", language)}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.actions.view", language)}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition">
            <h4 className="font-medium text-foreground">{t("dashboard.nav.reports", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">{t("dashboard.actions.districtCoverage", language)}</p>
          </div>
          <div className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition">
            <h4 className="font-medium text-foreground">{t("reports.defaulterTracking", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">{t("vaccinations.stats.requiresFollowUp", language)}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
