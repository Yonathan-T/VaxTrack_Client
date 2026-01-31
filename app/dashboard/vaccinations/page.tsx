"use client"

import { VaccinationsList } from "@/components/vaccinations/vaccinations-list"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { RoleProtected } from "@/lib/role-protected"

export default function VaccinationsPage() {
  const { language } = useLanguage()

  return (
    <RoleProtected allowedRoles={["healthcare_worker", "woreda_officer", "admin", "system_administrator", "super_admin", "parent"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("vaccinations.title", language)}</h1>
          <p className="text-muted-foreground">{t("vaccinations.subtitle", language)}</p>
        </div>

        <VaccinationsList />
      </div>
    </RoleProtected>
  )
}
