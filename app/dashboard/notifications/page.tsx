"use client"

import { useUser } from "@/lib/user-context"
import { useLanguage } from "@/lib/language-context"
import { NotificationsList } from "@/components/notifications/notifications-list"
import { NotificationSettings } from "@/components/notifications/notification-settings"
import { ParentNotificationsList } from "@/components/notifications/parent-notifications-list"
import { ParentNotificationSettings } from "@/components/notifications/parent-notification-settings"
import { Card } from "@/components/ui/card"

export default function NotificationsPage() {
  const { user } = useUser()
  const { language } = useLanguage()
  const isParent = user?.role === "parent"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isParent ? (language === "am" ? "ክትባት ማስታወቂያዎች" : "Vaccination Notifications") : "Notifications"}
        </h1>
        <p className="text-muted-foreground">
          {isParent
            ? language === "am"
              ? "የልጆቻችሁን ክትባት ማስታወቂያዎች ይቀበሉ"
              : "Receive vaccination reminders for your children"
            : "Manage SMS and email notifications for appointments"}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">{isParent ? <ParentNotificationsList /> : <NotificationsList />}</div>
        <div>
          {isParent ? (
            <ParentNotificationSettings />
          ) : (
            <Card className="p-6">
              <NotificationSettings />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
