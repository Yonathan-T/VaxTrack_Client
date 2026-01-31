"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, RefreshCw, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { getChildrenList, getChildProfile, type ChildProfile } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface VaccinationRecord {
  id: string
  childId: string
  childName: string
  vaccine: string
  date: string
  batchNumber: string
  administeredBy: string
  nextDue: string
  status: "completed" | "scheduled" | "overdue"
}

export function VaccinationsList() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchVaccinations = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      // Get all children first
      const childrenRes = await getChildrenList()

      // Consider empty error objects as non-errors; log only if meaningful
      const hasMeaningfulError = !!(childrenRes as any)?.error && Object.keys((childrenRes as any).error || {}).length > 0
      if (hasMeaningfulError) {
        console.error("[VaccinationsList] Error fetching children:", childrenRes.error)
        setVaccinations([])
        return
      }

      // Normalize response shape: supports {data:{data:[]}}, {data:{children:[]}}, or direct array
      const responseData = childrenRes.data as any
      const childrenData = responseData?.data || responseData?.children || responseData || []
      const childrenArray = Array.isArray(childrenData) ? childrenData : []

      // Fetch vaccination records for each child
      const vaccinationRecords: VaccinationRecord[] = []

      for (const child of childrenArray) {
        try {
          const childProfileRes = await getChildProfile(child.id)
          if (childProfileRes.data) {
            const childData = childProfileRes.data as any
            // Check if child has vaccination records
            if (childData.vaccination_records && Array.isArray(childData.vaccination_records)) {
              childData.vaccination_records.forEach((record: any) => {
                vaccinationRecords.push({
                  id: record.id?.toString() || `${child.id}_${Date.now()}`,
                  childId: child.id,
                  childName: (child.first_name && child.last_name)
                    ? `${child.first_name} ${child.last_name}`
                    : child.name || childData.name || "Unknown",
                  vaccine: record.vaccine?.name || record.vaccineName || "Unknown",
                  date: record.date_administered || record.dateAdministered || "-",
                  batchNumber: record.batch_number || record.batchNumber || "-",
                  administeredBy:
                    record.administer?.name ||
                    record.user?.name ||
                    record.administered_by_name ||
                    record.administered_by ||
                    record.administeredBy ||
                    "-",
                  nextDue: record.next_due_date || record.nextDueDate || "-",
                  status: record.status === "completed" ? "completed" : record.status === "overdue" ? "overdue" : "scheduled",
                })
              })
            }
          }
        } catch (err) {
          console.error(`[VaccinationsList] Error fetching child ${child.id}:`, err)
        }
      }

      setVaccinations(vaccinationRecords)
    } catch (error) {
      console.error("[VaccinationsList] Error:", error)
      setVaccinations([])
    } finally {
      if (showRefreshIndicator) {
        setIsRefreshing(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchVaccinations()
  }, [])

  const handleRefresh = () => {
    fetchVaccinations(true)
  }

  // Group vaccinations by child
  const groupedVaccinations = vaccinations.reduce((acc, vaccination) => {
    if (!acc[vaccination.childId]) {
      acc[vaccination.childId] = {
        childId: vaccination.childId,
        childName: vaccination.childName,
        vaccinations: [],
        totalVaccinations: 0,
        completedVaccinations: 0,
        scheduledVaccinations: 0,
        overdueVaccinations: 0,
      }
    }
    acc[vaccination.childId].vaccinations.push(vaccination)
    acc[vaccination.childId].totalVaccinations++
    
    if (vaccination.status === "completed") {
      acc[vaccination.childId].completedVaccinations++
    } else if (vaccination.status === "scheduled") {
      acc[vaccination.childId].scheduledVaccinations++
    } else if (vaccination.status === "overdue") {
      acc[vaccination.childId].overdueVaccinations++
    }
    
    return acc
  }, {} as Record<string, any>)

  const groupedArray = Object.values(groupedVaccinations)

  const filteredGroupedVaccinations = groupedArray
    .filter((group: any) => {
      const matchesSearch = group.childName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "completed" && group.completedVaccinations > 0) ||
        (filterStatus === "scheduled" && group.scheduledVaccinations > 0) ||
        (filterStatus === "overdue" && group.overdueVaccinations > 0)
      return matchesSearch && matchesStatus
    })
    .sort((a: any, b: any) => a.childName.localeCompare(b.childName))

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("vaccinations.searchPlaceholder", language)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t("vaccinations.filterByStatus", language)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("vaccinations.allStatus", language)}</SelectItem>
            <SelectItem value="completed">{t("vaccinations.completed", language)}</SelectItem>
            <SelectItem value="scheduled">{t("vaccinations.scheduled", language)}</SelectItem>
            <SelectItem value="overdue">{t("children.overdue", language)}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? "..." : t("common.refresh", language) || "Refresh"}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b">
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[150px]">
                  {t("children.title", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[120px]">
                  Total Vaccinations
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[100px]">
                  {t("vaccinations.completed", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[100px]">
                  {t("vaccinations.scheduled", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[100px]">
                  {t("children.overdue", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[120px]">
                  Last Vaccination
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[80px]">
                  {t("dashboard.actions.view", language)}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredGroupedVaccinations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                    {t("vaccinations.noVaccinations", language)}
                  </td>
                </tr>
              ) : (
                filteredGroupedVaccinations.map((group: any) => {
                  const lastVaccination = group.vaccinations
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                  
                  return (
                    <tr key={group.childId} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-3 py-2 font-medium text-foreground">{group.childName}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {group.totalVaccinations}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        {group.completedVaccinations > 0 ? (
                          <Badge variant="default">{group.completedVaccinations}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {group.scheduledVaccinations > 0 ? (
                          <Badge variant="secondary">{group.scheduledVaccinations}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {group.overdueVaccinations > 0 ? (
                          <Badge variant="destructive">{group.overdueVaccinations}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {lastVaccination && lastVaccination.date && lastVaccination.date !== "-"
                          ? `${lastVaccination.vaccine} (${new Date(lastVaccination.date).toLocaleDateString()})`
                          : "-"
                        }
                      </td>
                      <td className="px-3 py-2">
                        <Link href={`/dashboard/children/${group.childId}`}>
                          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <Eye className="h-4 w-4" />
                            {t("children.view", language)}
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

