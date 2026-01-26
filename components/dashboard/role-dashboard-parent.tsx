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
import { cn } from "@/lib/utils"

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
        {[
          {
            title: language === "am" ? "ሁሉንም የወሰዱ" : "Up to Date",
            value: upToDateCount,
            change: language === "am" ? "ልጆች" : "Children",
            icon: CheckCircle,
            color: "text-green-600",
            bgGradient: "from-green-500/10 to-green-600/5",
            borderColor: "rgb(34 197 94)",
          },
          {
            title: language === "am" ? "ሚገባ" : "Due for Vaccination",
            value: dueCount,
            change: language === "am" ? "ልጆች" : "Children",
            icon: Syringe,
            color: "text-orange-600",
            bgGradient: "from-orange-500/10 to-orange-600/5",
            borderColor: "rgb(251 146 60)",
          },
          {
            title: language === "am" ? "ክትባት ያለፈባቸው" : "Overdue Vaccines",
            value: totalOverdueVaccines,
            change: overdueBreakdown.length > 0 
              ? overdueBreakdown.map(item => `${item.name}: ${item.count}`).join(", ")
              : (language === "am" ? "ምንም የለም" : "None"),
            icon: AlertCircle,
            color: "text-red-600",
            bgGradient: "from-red-500/10 to-red-600/5",
            borderColor: "rgb(239 68 68)",
          },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className={cn(
                "p-6 relative overflow-hidden",
                "transition-all duration-500 ease-out",
                "hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1",
                "border-l-4",
                isLoading ? "animate-pulse" : "animate-fade-in-up"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                borderLeftColor: stat.borderColor,
              }}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
                  stat.bgGradient,
                  isLoading ? "opacity-30" : "opacity-100"
                )}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {isLoading ? (
                        <span className="inline-block w-12 h-8 bg-muted rounded animate-pulse" />
                      ) : (
                        stat.value.toLocaleString()
                      )}
                    </p>
                    <p className={cn("text-xs mt-1", stat.color === "text-red-600" ? "text-red-600" : "text-muted-foreground")}>
                      {stat.change}
                    </p>
                  </div>
                  <Icon className={cn("h-10 w-10", stat.color, "opacity-50 drop-shadow-sm transition-transform duration-500 hover:scale-110 hover:rotate-12")} />
                </div>
              </div>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none opacity-0 hover:opacity-100" />
            </Card>
          )
        })}
      </div>

      <ParentViewChildren childrenData={children} />

      <ParentVaccinationReminders />
    </div>
  )
}
