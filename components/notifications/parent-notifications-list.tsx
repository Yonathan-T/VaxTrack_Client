"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle2, AlertCircle, Clock, Calendar } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useChildren } from "@/lib/children-context"
import { useUser } from "@/lib/user-context"

export function ParentNotificationsList() {
  const { language } = useLanguage()
  const { getChildrenByParent } = useChildren()
  const { user } = useUser()

  const parentId = user?.id || "parent_1"
  const parentChildren = getChildrenByParent(parentId)

  const notifications = [
    {
      id: 1,
      type: "reminder",
      child: parentChildren[0]?.firstName || "Child",
      vaccine: "Penta 2",
      message: `${parentChildren[0]?.firstName || "Your child"} has a Penta 2 vaccination appointment`,
      status: "upcoming",
      date: "2024-12-20",
      time: "10:00 AM",
    },
    {
      id: 2,
      type: "alert",
      child: parentChildren[0]?.firstName || "Child",
      vaccine: "OPV 2",
      message: `Vaccination due: ${parentChildren[0]?.firstName || "Your child"} needs OPV 2 vaccine`,
      status: "due",
      date: "2024-12-20",
    },
    {
      id: 3,
      type: "confirmation",
      child: parentChildren[1]?.firstName || "Child",
      vaccine: "Measles",
      message: "Appointment confirmed for Measles vaccination",
      status: "completed",
      date: "2024-11-15",
    },
    {
      id: 4,
      type: "reminder",
      child: parentChildren[0]?.firstName || "Child",
      vaccine: "Pentavalent Booster",
      message: `Upcoming: ${parentChildren[0]?.firstName || "Your child"} needs Pentavalent Booster`,
      status: "upcoming",
      date: "2024-12-25",
    },
  ].filter((notif) => parentChildren.some((child) => child.firstName === notif.child.split(" ")[0]))

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "due":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "upcoming":
        return <Calendar className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "due":
        return "bg-red-100 text-red-700 border-red-200"
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return language === "am" ? "ተጠናቋል" : "Completed"
      case "due":
        return language === "am" ? "ሚገባ" : "Due"
      case "upcoming":
        return language === "am" ? "ወደ ፊት" : "Upcoming"
      default:
        return language === "am" ? "ጣ待ち" : "Pending"
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          {language === "am" ? "ክትባት ማስታወቂያዎች" : "Vaccination Notifications"}
        </h3>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">{language === "am" ? "ምንም ማስታወቂያዎች የሉም" : "No notifications"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(notification.status)}
                  <div>
                    <p className="font-medium text-foreground">{notification.vaccine}</p>
                    <p className="text-sm text-muted-foreground">{notification.child}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(notification.status)}>{getStatusLabel(notification.status)}</Badge>
              </div>

              <p className="text-sm text-foreground mb-2">{notification.message}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {language === "am" ? "ቀን:" : "Date:"} {notification.date}
                  {notification.time && ` · ${notification.time}`}
                </span>
                {notification.status === "due" && (
                  <Button size="sm" className="ml-2">
                    {language === "am" ? "አስቀድም" : "Schedule"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
