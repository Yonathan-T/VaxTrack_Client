"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Calendar, AlertCircle } from "lucide-react"
import { useChildren } from "@/lib/children-context"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import Link from "next/link"

export function ParentVaccinationReminders() {
  const { getChildrenByParent } = useChildren()
  const { language } = useLanguage()
  const { user } = useUser()

  const parentId = user?.id || "parent_1"
  const parentChildren = getChildrenByParent(parentId)

  const reminders = [
    {
      id: 1,
      childName: parentChildren[0]?.firstName || "Child",
      vaccine: "Penta 2",
      dueDate: "2024-12-20",
      priority: "high",
      type: "upcoming",
    },
    {
      id: 2,
      childName: parentChildren[0]?.firstName || "Child",
      vaccine: "OPV 2",
      dueDate: "2024-12-20",
      priority: "high",
      type: "upcoming",
    },
    {
      id: 3,
      childName: parentChildren[1]?.firstName || "Child",
      vaccine: "Measles",
      dueDate: "2024-12-25",
      priority: "medium",
      type: "scheduled",
    },
  ].filter((reminder) => parentChildren.some((child) => child.firstName === reminder.childName.split(" ")[0]))

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
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

      {reminders.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            {language === "am" ? "ምንም ማስታወቂያዎች የሉም" : "No reminders at this time"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{reminder.vaccine}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === "am" ? "ልጅ:" : "Child:"} {reminder.childName} - {language === "am" ? "መቼ:" : "Due:"}{" "}
                    {reminder.dueDate}
                  </p>
                </div>
              </div>
              <Badge className={getPriorityColor(reminder.priority)}>
                {reminder.priority === "high"
                  ? language === "am"
                    ? "ተ급"
                    : "Urgent"
                  : reminder.priority === "medium"
                    ? language === "am"
                      ? "መካከለኛ"
                      : "Medium"
                    : language === "am"
                      ? "ዝቅተኛ"
                      : "Low"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
