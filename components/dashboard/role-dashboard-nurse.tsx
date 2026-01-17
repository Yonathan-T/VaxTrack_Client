"use client"

import { Card } from "@/components/ui/card"
import { AlertCircle, Syringe, Package, Clock } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

interface RoleDashboardProps {
  language: string
}

export function NurseDashboard({ language: initialLanguage }: RoleDashboardProps) {
  const { language } = useLanguage()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t("dashboard.role.nurse", language)}</h2>
        <p className="text-muted-foreground">{t("dashboard.role.nurseDesc", language)}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.stats.vaccinationsToday", language)}</p>
              <p className="text-3xl font-bold text-foreground mt-2">34</p>
              <p className="text-xs text-green-600 mt-1">+5 {t("vaccinations.completed", language)}</p>
            </div>
            <Syringe className="h-10 w-10 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("inventory.stats.lowStockItems", language)}</p>
              <p className="text-3xl font-bold text-foreground mt-2">3</p>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.requiresRestocking", language)}</p>
            </div>
            <Package className="h-10 w-10 text-secondary opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.stats.upcomingAppointments", language)}</p>
              <p className="text-3xl font-bold text-foreground mt-2">8</p>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.thisWeek", language)}</p>
            </div>
            <Clock className="h-10 w-10 text-accent opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-orange-200 bg-orange-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-900">{t("inventory.expiringSoon", language)}</p>
              <p className="text-3xl font-bold text-orange-700 mt-2">2</p>
              <p className="text-xs text-orange-600 mt-1">{t("dashboard.within30Days", language)}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-orange-600 opacity-50" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.quickActions", language)}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition">
            <h4 className="font-medium text-foreground">{t("vaccinations.recordVaccination", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {t("vaccinations.startRecordingVaccinations", language)}
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition">
            <h4 className="font-medium text-foreground">{t("inventory.addStock", language)}</h4>
            <p className="text-sm text-muted-foreground mt-1">{t("inventory.subtitle", language)}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
