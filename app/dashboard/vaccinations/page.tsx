"use client"

import { VaccinationsList } from "@/components/vaccinations/vaccinations-list"
import { VaccinationStats } from "@/components/vaccinations/vaccination-stats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { RoleProtected } from "@/lib/role-protected"
import { useUser } from "@/lib/user-context"

export default function VaccinationsPage() {
  const { language } = useLanguage()
  const { user } = useUser()

  const canRecord = user?.role === "healthcare_worker" || user?.role === "system_administrator" || user?.role === "super_admin"

  return (
    <RoleProtected allowedRoles={["healthcare_worker", "woreda_officer", "admin", "system_administrator", "super_admin", "parent"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("vaccinations.title", language)}</h1>
            <p className="text-muted-foreground">{t("vaccinations.subtitle", language)}</p>
          </div>
          {canRecord && (
            <Link href="/dashboard/vaccinations/record">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("vaccinations.recordVaccination", language)}
              </Button>
            </Link>
          )}
        </div>

        {user?.role !== "parent" && <VaccinationStats />}
        <VaccinationsList />
      </div>
    </RoleProtected>
  )
}
