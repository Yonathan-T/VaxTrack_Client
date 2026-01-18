"use client"

import { ChildrenList } from "@/components/children/children-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { RoleProtected } from "@/lib/role-protected"
import { useUser } from "@/lib/user-context"

export default function ChildrenPage() {
  const { language } = useLanguage()
  const { user } = useUser()

  const canRegister = user?.role === "healthcare_worker" || user?.role === "admin"

  return (
    <RoleProtected allowedRoles={["healthcare_worker", "woreda_officer", "admin", "parent"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("children.title", language)}</h1>
            <p className="text-muted-foreground">{t("children.subtitle", language)}</p>
          </div>
          {canRegister && (
            <Link href="/dashboard/children/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("children.registerChild", language)}
              </Button>
            </Link>
          )}
        </div>

        <ChildrenList />
      </div>
    </RoleProtected>
  )
}
