"use client"

import { RegisterChildForm } from "@/components/children/register-child-form"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { RoleProtected } from "@/lib/role-protected"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function NewChildPage() {
  const { language } = useLanguage()
  const router = useRouter()

  return (
    <RoleProtected allowedRoles={["healthcare_worker", "admin", "system_administrator", "super_admin"]}>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("children.registerNewChild", language)}</h1>
              <p className="text-muted-foreground mt-1">{t("children.enterChildGuardianInfo", language)}</p>
            </div>
          </div>

          <Card className="p-6 md:p-8 shadow-sm">
            <RegisterChildForm />
          </Card>
        </div>
      </div>
    </RoleProtected>
  )
}
