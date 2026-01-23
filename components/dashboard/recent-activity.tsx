"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function RecentActivity() {
  const { language } = useLanguage()

  const activities: any[] = []

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{t("dashboard.activity.recentActivity", language)}</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity) => (
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
          ))
        )}
      </div>
    </Card>
  )
}
