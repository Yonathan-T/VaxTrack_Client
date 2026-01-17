"use client"
import { Card } from "@/components/ui/card"
import { Calendar, Syringe, CheckCircle } from "lucide-react"
import { useChildren } from "@/lib/children-context"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { ParentViewChildren } from "./parent-view-children"
import { ParentVaccinationReminders } from "./parent-vaccination-reminders"
import { ParentAccountSettings } from "./parent-account-settings"

interface RoleDashboardProps {
  language: string
}

export function ParentDashboard({ language }: RoleDashboardProps) {
  const { getChildrenByParent } = useChildren()
  const { language: currentLanguage } = useLanguage()
  const { user } = useUser()

  const parentId = user?.id || "parent_1"
  const parentChildren = getChildrenByParent(parentId)

  const upToDateCount = parentChildren.filter((child) => {
    const birthDate = new Date(child.dateOfBirth)
    const today = new Date()
    const ageInMonths = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return ageInMonths < 2
  }).length

  const dueCount = parentChildren.filter((child) => {
    const birthDate = new Date(child.dateOfBirth)
    const today = new Date()
    const ageInMonths = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return ageInMonths >= 2 && ageInMonths < 6
  }).length

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === "am" ? "ወላጅ/ጠበቂ ዳሽቦርድ" : "Parent/Guardian Dashboard"}
        </h2>
        <p className="text-muted-foreground">
          {language === "am" ? "የልጆቻችሁን ክትባት ቅዱስ ይከታተሉ" : "Track your children's vaccinations"}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 border-red-200 bg-red-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-900">{language === "am" ? "ወቅታዊ ክትባቶች" : "Up to Date"}</p>
              <p className="text-3xl font-bold text-red-700 mt-2">{upToDateCount}</p>
              <p className="text-xs text-red-600 mt-1">{language === "am" ? "ልጆች" : "Children"}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-red-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{language === "am" ? "ሚገባ" : "Due for Vaccination"}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dueCount}</p>
              <p className="text-xs text-muted-foreground mt-1">{language === "am" ? "ልጆች" : "Children"}</p>
            </div>
            <Syringe className="h-10 w-10 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{language === "am" ? "ጠቅላላ ልጆች" : "Total Children"}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{parentChildren.length}</p>
              <p className="text-xs text-muted-foreground mt-1">{language === "am" ? "በሲስተም ተመዝግበው" : "Registered"}</p>
            </div>
            <Calendar className="h-10 w-10 text-secondary opacity-50" />
          </div>
        </Card>
      </div>

      <ParentVaccinationReminders />

      <ParentAccountSettings />

      <ParentViewChildren />
    </div>
  )
}
