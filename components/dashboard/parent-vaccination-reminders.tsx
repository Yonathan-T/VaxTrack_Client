"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Calendar, AlertCircle, Syringe, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import Link from "next/link"
import { getNotifications } from "@/lib/parent-api"
import { useState, useEffect } from "react"

export function ParentVaccinationReminders() {
  const { language } = useLanguage()
  const { user } = useUser()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await getNotifications()
        if (data && data.notifications) {
          // Sort by date desc (if not already) and take top 3
          // Or just take top 3 as they likely come sorted
          setNotifications(data.notifications.slice(0, 3))
        }
      } catch (err) {
        console.error("Failed to fetch reminders:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "inventory_alert":
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "vaccination_reminder":
      case "reminder":
        return <Syringe className="h-5 w-5 text-orange-600" />
      case "test_notification":
      case "system":
        return <Bell className="h-5 w-5 text-blue-600" />
      case "info":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (type: string) => {
    switch (type) {
      case "inventory_alert":
      case "alert":
        return "bg-red-100 text-red-700 border-red-200"
      case "vaccination_reminder":
      case "reminder":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "test_notification":
      case "system":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "info":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {language === "am" ? "ክትባት ማስታወቂያዎች" : "Vaccination Reminders"}
          </h3>
        </div>
        <Link href="/dashboard/notifications">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            {language === "am" ? "ሁሉም ይመልከቱ" : "View All"}
          </Button>
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            {language === "am" ? "ምንም ማስታወቂያዎች የሉም" : "No new notifications"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(notification.type)}
                <div>
                  <p className="font-medium text-foreground text-sm">{notification.data?.title || "Notification"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.data?.message || notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {new Date(notification.created_at || notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(notification.type || "info")}>
                {notification.type === "inventory_alert" || notification.type === "alert" ? (language === "am" ? "ማስጠንቀቂያ" : "Alert") :
                  notification.type === "vaccination_reminder" || notification.type === "reminder" ? (language === "am" ? "ማስታወሻ" : "Vaccine") :
                    notification.type === "test_notification" || notification.type === "system" ? (language === "am" ? "ሲስተም" : "System") :
                      (language === "am" ? "መረጃ" : "Info")}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
