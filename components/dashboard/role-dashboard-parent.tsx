"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Calendar, Syringe, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { useChildren } from "@/lib/children-context"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { ParentViewChildren } from "./parent-view-children"
import { ParentVaccinationReminders } from "./parent-vaccination-reminders"
import { getParentDashboard, getChildren, getChildDetails, type Child, type ParentDashboard as ParentDashboardData } from "@/lib/parent-api"

interface RoleDashboardProps {
  language: string
}

// Utility to calculate child's age in months
function calculateAgeInMonths(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  return (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
}

export function ParentDashboard({ language }: RoleDashboardProps) {
  const { language: currentLanguage } = useLanguage()
  const { user } = useUser()
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch dashboard data from API - fetch list then details for each child to ensure deep data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: listData, error: listError } = await getChildren()
        if (listError || !listData) {
          console.error("Failed to fetch children list:", listError)
          return
        }

        // Fetch details for each child to get full vaccination records
        const detailedChildren = await Promise.all(
          listData.map(async (child) => {
            const { data: details } = await getChildDetails(child.id)
            return details || child
          })
        )

        setChildren(detailedChildren)
      } catch (err) {
        console.error("Failed to fetch parent dashboard data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  // Robust status check logic
  const today = new Date()

  const getChildStatus = (child: Child) => {
    const records = child.vaccination_records || []

    // Check for overdue
    const hasOverdue = records.some(v => {
      if (v.status === 'overdue') return true
      if (v.status === 'pending') {
        const dueDate = new Date(v.scheduled_date)
        return !isNaN(dueDate.getTime()) && dueDate < today
      }
      return false
    })

    if (hasOverdue) return "overdue"

    // Check for due (pending but not overdue)
    const hasDue = records.some(v => v.status === 'pending')
    if (hasDue) return "due"

    // Otherwise up to date
    return "uptodate"
  }

  // Calculate counts per child
  const getOverdueCount = (child: Child) => {
    return (child.vaccination_records || []).filter(v => {
      if (v.status === 'overdue') return true
      if (v.status === 'pending') {
        const dueDate = new Date(v.scheduled_date)
        return !isNaN(dueDate.getTime()) && dueDate < today
      }
      return false
    }).length
  }

  const totalOverdueVaccines = children.reduce((sum, child) => sum + getOverdueCount(child), 0)

  // Breakdown for tooltip/display: "Yonathan: 2"
  const overdueBreakdown = children
    .map(c => ({ name: c.first_name, count: getOverdueCount(c) }))
    .filter(item => item.count > 0)

  const dueCount = children.filter(c => getChildStatus(c) === "due").length
  // Up to date is anyone not overdue or due
  const upToDateCount = children.filter(c => getChildStatus(c) === "uptodate").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          {language === "am" ? `ሰላም, ${user?.name || "ወላጅ"}` : `Hello, ${user?.name || "Parent"}`}
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          {language === "am" ? "እንኳን ደህና መጡ" : "Welcome back"}
        </p>

        {/* <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === "am" ? "የወላጅ ዳሽቦርድ" : "Parent Dashboard"}
        </h2> */}
        <p className="text-muted-foreground">
          {language === "am" ? "የልጆቻችሁን ክትባት ይከታተሉ" : "Track your children's vaccinations"}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 border-green-200 bg-green-50/50 
    transition-all duration-300 ease-out
    hover:shadow-xl hover:shadow-green-200/40
    hover:-translate-y-1
    hover:border-green-300
    group ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-900">{language === "am" ? "ሁሉንም የወሰዱ" : "Up to Date"}</p>
              <p className="text-3xl font-bold text-green-700 mt-2">{upToDateCount}</p>
              <p className="text-xs text-green-600 mt-1">{language === "am" ? "ልጆች" : "Children"}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-orange-200 bg-orange-50/50 
    transition-all duration-300 ease-out
    hover:shadow-xl hover:shadow-orange-200/40
    hover:-translate-y-1
    hover:border-orange-300
    group ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-900">{language === "am" ? "ሚገባ" : "Due for Vaccination"}</p>
              <p className="text-3xl font-bold text-orange-700 mt-2">{dueCount}</p>
              <p className="text-xs text-orange-600 mt-1">{language === "am" ? "ልጆች" : "Children"}</p>
            </div>
            <Syringe className="h-10 w-10 text-orange-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-red-200 bg-red-50/50 
    transition-all duration-300 ease-out
    hover:shadow-xl hover:shadow-red-200/40
    hover:-translate-y-1
    hover:border-red-300
    group ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-900">{language === "am" ? "ክትባት ያለፈባቸው" : "Overdue Vaccines"}</p>
              <p className="text-3xl font-bold text-red-700 mt-2">{totalOverdueVaccines}</p>

              <div className="mt-2 space-y-1">
                {overdueBreakdown.length > 0 ? (
                  overdueBreakdown.map((item, idx) => (
                    <p key={idx} className="text-xs text-red-600 font-medium">
                      {item.name}: {item.count} {language === "am" ? "ክትባቶች" : "vax"}
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-red-600">{language === "am" ? "ምንም የለም" : "None"}</p>
                )}
              </div>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-50" />
          </div>
        </Card>
      </div>

      <ParentViewChildren childrenData={children} />

      <ParentVaccinationReminders />
    </div>
  )
}
