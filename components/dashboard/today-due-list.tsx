"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Phone, User, AlertTriangle, Loader2, ChevronRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { getTodayDue, TodayDueChild } from "@/lib/healthcare-worker-api"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function TodayDueList() {
  const { language } = useLanguage()
  const router = useRouter()
  const [children, setChildren] = useState<TodayDueChild[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTodayDue = async () => {
      try {
        setIsLoading(true)
        const response = await getTodayDue()

        if (response.error) {
          console.error("[TodayDueList] Error fetching today due:", response.error)
          setChildren([])
          return
        }

        const data = response.data as any
        const childrenData = data?.data || []
        setChildren(childrenData)
      } catch (error) {
        console.error("[TodayDueList] Error:", error)
        setChildren([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTodayDue()
    // Refresh every 30 seconds
    const interval = setInterval(fetchTodayDue, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  if (children.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {language === "am" ? "ዛሬ የሚገባ" : "Today's Due Vaccinations"}
          </h3>
        </div>
        <p className="text-muted-foreground text-center py-4">
          {language === "am" ? "ዛሬ የሚገባ ክትባት የለም" : "No vaccinations due today"}
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {language === "am" ? "ዛሬ የሚገባ" : "Today's Due Vaccinations"}
          </h3>
        </div>
        <Badge variant="secondary">{children.length}</Badge>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {children.map((child) => (
          <div
            key={child.id}
            className={cn(
              "p-4 border rounded-lg transition-all duration-200",
              "hover:shadow-md hover:border-primary/50 cursor-pointer",
              child.overdue_count > 0 && "border-red-200 bg-red-50/50"
            )}
            onClick={() => router.push(`/dashboard/children/${child.id}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">
                    {child.first_name} {child.last_name}
                  </h4>
                  {child.overdue_count > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {child.overdue_count} {language === "am" ? "የተዘገየ" : "overdue"}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>
                      {language === "am" ? "ወላጅ" : "Parent"}: {child.parent_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span className="font-mono">{child.parent_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {language === "am" ? "ጠቅላላ በመጠባበት ላይ" : "Total Pending"}: {child.total_pending}
                    </span>
                  </div>
                </div>

                {child.overdue_vaccines && child.overdue_vaccines.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-medium text-red-600">
                        {language === "am" ? "የተዘገዩ ክትባቶች" : "Overdue Vaccines"}:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {child.overdue_vaccines.slice(0, 3).map((vaccine) => (
                        <Badge key={vaccine.id} variant="outline" className="text-xs border-red-200 text-red-700">
                          {vaccine.vaccine?.name || vaccine.vaccine?.code}
                        </Badge>
                      ))}
                      {child.overdue_vaccines.length > 3 && (
                        <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                          +{child.overdue_vaccines.length - 3} {language === "am" ? "ተጨማሪ" : "more"}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>

      {children.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard/children")}
          >
            {language === "am" ? "ሁሉንም ልጆች ይመልከቱ" : "View All Children"}
          </Button>
        </div>
      )}
    </Card>
  )
}
