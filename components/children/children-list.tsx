"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Eye } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useChildren } from "@/lib/children-context"
import { useUser } from "@/lib/user-context"
import { t } from "@/lib/translations"

export function ChildrenList() {
  const { language } = useLanguage()
  const { children: childrenList } = useChildren()
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")

  const displayChildren =
    user?.role === "parent" ? childrenList.filter((child) => child.parentId === user.id) : childrenList

  const getVaccinationStatus = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    const ageInMonths = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)

    if (ageInMonths < 2) return "up-to-date"
    if (ageInMonths < 6) return "due"
    return "overdue"
  }

  const filteredChildren = displayChildren.filter(
    (child) =>
      `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${child.guardianFirstName} ${child.guardianLastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (child.vaccineId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
  )

  const sortedChildren = [...filteredChildren].sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
    return nameA.localeCompare(nameB)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("children.searchPlaceholder", language)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b">
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[150px]">
                  {t("children.title", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[100px]">
                  {t("children.vaccineId", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[110px]">
                  {t("children.dateOfBirth", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[80px]">
                  {t("children.gender", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[150px]">
                  {t("children.guardian", language)}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[120px]">
                  {t("children.phone", language)}
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
              {sortedChildren.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    {t("children.noChildrenFound", language)}
                  </td>
                </tr>
              ) : (
                sortedChildren.map((child) => {
                  const status = getVaccinationStatus(child.dateOfBirth)
                  return (
                    <tr key={child.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-3 py-2 font-medium text-foreground">
                        {child.firstName} {child.middleName} {child.lastName}
                      </td>
                      <td className="px-3 py-2 font-mono font-semibold text-primary bg-muted/30">{child.vaccineId}</td>
                      <td className="px-3 py-2 text-foreground">{child.dateOfBirth}</td>
                      <td className="px-3 py-2 text-foreground capitalize">{child.gender}</td>
                      <td className="px-3 py-2 text-foreground">
                        {child.guardianFirstName} {child.guardianLastName}
                      </td>
                      <td className="px-3 py-2 text-foreground">{child.guardianPhone}</td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={status === "up-to-date" ? "default" : status === "due" ? "secondary" : "destructive"}
                        >
                          {status === "up-to-date"
                            ? t("children.upToDate", language)
                            : status === "due"
                              ? t("children.due", language)
                              : t("children.overdue", language)}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Link href={`/dashboard/children/${child.id}`}>
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
