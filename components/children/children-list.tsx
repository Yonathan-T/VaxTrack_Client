"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { t } from "@/lib/translations"
import { getChildrenList, type ChildProfile } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function ChildrenList() {
  const { language } = useLanguage()
  const { user } = useUser()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchChildren = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await getChildrenList(searchQuery || undefined)

      if (response.error) {
        console.error("[ChildrenList] Fetch failed:", {
          status: response.status,
          message: response.error.message,
          fullError: response.error
        })
        toast({
          title: language === "am" ? "ስህተት" : "Error",
          description: response.error.message || (language === "am" ? "ልጆችን መጫን አልተቻለም" : "Failed to load children"),
          variant: "destructive",
        })
        setChildren([])
        return
      }

      if (response.data) {
        const childrenData = (response.data as any).data || response.data
        const childrenArray = Array.isArray(childrenData) ? childrenData : []
        setChildren(childrenArray)
      } else {
        setChildren([])
      }
    } catch (error) {
      console.error("[ChildrenList] Error:", error)
      setChildren([])
    } finally {
      if (showRefreshIndicator) {
        setIsRefreshing(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  const handleRefresh = () => {
    fetchChildren(true)
  }

  const handleSearch = () => {
    fetchChildren()
  }

  // Prefer computing status from actual vaccination records when available; otherwise fall back.
  const getVaccinationStatus = (child: any) => {
    try {
      const records: any[] = Array.isArray((child as any).vaccination_records)
        ? (child as any).vaccination_records
        : []

      if (records.length > 0) {
        const today = new Date()
        const hasOverdue = records.some((v: any) => {
          const status = (v as any).status
          if (status === "overdue") return true
          if (status === "pending" || status === "scheduled") {
            const due = (v as any).scheduled_date || (v as any).scheduledDate
            const dueDate = due ? new Date(due) : null
            return !!dueDate && !isNaN(dueDate.getTime()) && dueDate < today
          }
          return false
        })
        if (hasOverdue) return "overdue"

        const hasDue = records.some((v: any) => {
          const status = (v as any).status
          if (status === "pending" || status === "scheduled") {
            const due = (v as any).scheduled_date || (v as any).scheduledDate
            const dueDate = due ? new Date(due) : null
            return !!dueDate && !isNaN(dueDate.getTime()) && dueDate >= today
          }
          return false
        })
        if (hasDue) return "due"

        return "up-to-date"
      }

      // Fallback heuristic if records are not present in the list response
      const dateOfBirth: string = (child as any).date_of_birth || (child as any).dateOfBirth
      if (!dateOfBirth) return "unknown"
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      const ageInMonths = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      if (ageInMonths < 2) return "up-to-date"
      if (ageInMonths < 6) return "due"
      return "overdue"
    } catch {
      return "unknown"
    }
  }

  const filteredChildren = children.filter((child) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    const fullName = `${child.first_name} ${child.last_name}`.toLowerCase()
    const parentName = child.parent?.name?.toLowerCase() || ""
    const parentEmail = child.parent?.email?.toLowerCase() || ""
    const parentPhone = child.parent?.phone || ""
    const childId = child.id?.toString().toLowerCase() || ""

    return (
      fullName.includes(searchLower) ||
      parentName.includes(searchLower) ||
      parentEmail.includes(searchLower) ||
      parentPhone.includes(searchLower) ||
      childId.includes(searchLower)
    )
  })

  const sortedChildren = [...filteredChildren].sort((a, b) => {
    const nameA = `${a.first_name} ${a.last_name}`.toLowerCase()
    const nameB = `${b.first_name} ${b.last_name}`.toLowerCase()
    return nameA.localeCompare(nameB)
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 flex-1 bg-muted animate-pulse rounded" />
                <div className="h-12 w-24 bg-muted animate-pulse rounded" />
                <div className="h-12 w-32 bg-muted animate-pulse rounded" />
                <div className="h-12 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("children.searchPlaceholder", language)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? "..." : "Refresh"}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b">
                <th className="px-4 py-3 text-left font-semibold text-foreground">{t("children.id", language) || "ID"}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground min-w-[140px]">{t("children.title", language) || "Child Name"}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">{t("children.dateOfBirth", language) || "Date of Birth"}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">{t("children.gender", language) || "Gender"}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">{t("children.guardian", language) || "Parent/Guardian"}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">{t("children.phone", language) || "Phone"}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">{t("children.status", language) || "Status"}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">{t("dashboard.actions.view", language) || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {sortedChildren.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    {t("children.noChildrenFound", language) || "No children found"}
                  </td>
                </tr>
              ) : (
                sortedChildren.map((child) => {
                  const status = getVaccinationStatus(child as any)
                  const parent = child.parent
                  const fullName = `${child.first_name} ${child.last_name}`.trim()
                  const dob = child.date_of_birth
                    ? new Date(child.date_of_birth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "-"

                  return (
                    <tr key={child.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-primary bg-muted/30">
                        {child.id}
                      </td>
                      <td className="px-4 py-3 max-w-[220px] align-top">
                        <div className="font-medium text-foreground break-words">{fullName || "-"}</div>
                        {child.facility && (
                          <div className="text-xs text-muted-foreground mt-1 break-words">{child.facility.name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground">{dob}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize">
                          {child.sex || "-"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-foreground max-w-[180px] align-top">
                        {parent?.name ? <span className="font-medium break-words">{parent.name}</span> : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono text-sm max-w-[140px] align-top">
                        {parent?.phone ? (
                          <a href={`tel:${parent.phone}`} className="text-primary hover:underline block truncate max-w-full">
                            {parent.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground text-sm max-w-[180px] align-top">
                        {parent?.email ? (
                          <a href={`mailto:${parent.email}`} className="text-primary hover:underline block truncate max-w-full">
                            {parent.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            status === "up-to-date"
                              ? "default"
                              : status === "due"
                                ? "secondary"
                                : status === "unknown"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {status === "up-to-date"
                            ? t("children.upToDate", language) || "Up to Date"
                            : status === "due"
                              ? t("children.due", language) || "Due"
                              : status === "unknown"
                                ? "Unknown"
                                : t("children.overdue", language) || "Overdue"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/children/${child.id}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            {t("children.view", language) || "View"}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
