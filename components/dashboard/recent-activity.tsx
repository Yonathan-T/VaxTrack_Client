"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function RecentActivity() {
  const { language } = useLanguage()

  const activities = [
    {
      id: 1,
      action: t("dashboard.activity.vaccinationRecorded", language),
      child: "Abebe Kebede",
      vaccine: "BCG",
      time: t("dashboard.activity.tenMinutesAgo", language),
      type: "vaccination",
    },
    {
      id: 2,
      action: t("dashboard.activity.childRegistered", language),
      child: "Tigist Alemu",
      vaccine: null,
      time: t("dashboard.activity.oneHourAgo", language),
      type: "registration",
    },
    {
      id: 3,
      action: t("dashboard.activity.appointmentScheduled", language),
      child: "Dawit Tesfaye",
      vaccine: "Penta 1",
      time: t("dashboard.activity.twoHoursAgo", language),
      type: "appointment",
    },
    {
      id: 4,
      action: t("dashboard.activity.vaccinationRecorded", language),
      child: "Sara Mulugeta",
      vaccine: "OPV 2",
      time: t("dashboard.activity.threeHoursAgo", language),
      type: "vaccination",
    },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{t("dashboard.activity.recentActivity", language)}</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">{activity.action}</p>
              <p className="text-sm text-muted-foreground">
                {activity.child}
                {activity.vaccine && ` - ${activity.vaccine}`}
              </p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
            <Badge variant={activity.type === "vaccination" ? "default" : "secondary"} className="text-xs">
              {activity.type}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
