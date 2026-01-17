"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useChildren } from "@/lib/children-context"
import { useVaccinations } from "@/lib/vaccinations-context"

export function VaccinationsList() {
  const { language } = useLanguage()
  const { children } = useChildren()
  const { vaccinations } = useVaccinations()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const childNameMap = children.reduce(
    (acc, child) => {
      acc[child.id] = `${child.firstName} ${child.lastName}`
      return acc
    },
    {} as Record<string, string>,
  )

  const filteredVaccinations = vaccinations
    .map((vaccination) => ({
      ...vaccination,
      childName: childNameMap[vaccination.childId] || "Unknown Child",
    }))
    .filter((vaccination) => {
      const matchesSearch =
        vaccination.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vaccination.vaccine.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === "all" || vaccination.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
                  {t("vaccinations.vaccine", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[110px]">
                  {t("vaccinations.dateAdministered", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[100px]">
                  {t("vaccinations.batchNumber", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[130px]">
                  {t("vaccinations.administeredBy", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[100px]">
                  {t("vaccinations.nextDue", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[100px]">
                  {t("children.status", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[80px]">
                  {t("dashboard.actions.view", language)}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVaccinations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    {t("vaccinations.noVaccinations", language)}
                  </td>
                </tr>
              ) : (
                filteredVaccinations.map((vaccination) => (
                  <tr key={vaccination.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-3 py-2 font-medium text-foreground">{vaccination.childName}</td>
                    <td className="px-3 py-2 text-foreground">{vaccination.vaccine}</td>
                    <td className="px-3 py-2 text-foreground">{vaccination.date}</td>
                    <td className="px-3 py-2 font-mono font-semibold text-primary bg-muted/30">
                      {vaccination.batchNumber}
                    </td>
                    <td className="px-3 py-2 text-foreground">{vaccination.administeredBy}</td>
                    <td className="px-3 py-2 text-foreground">{vaccination.nextDue}</td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          vaccination.status === "completed"
                            ? "default"
                            : vaccination.status === "scheduled"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {t(`vaccinations.${vaccination.status}`, language)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Link href={`/dashboard/children/${vaccination.childId}`}>
                        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                          <Eye className="h-4 w-4" />
                          {t("children.view", language)}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
