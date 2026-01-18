"use client"

import { ChildProfile } from "@/components/children/child-profile"
import { VaccinationHistory } from "@/components/children/vaccination-history"
import { ParentChildDetails } from "@/components/dashboard/parent-child-details"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { t } from "@/lib/translations"
import * as React from "react"

export default function ChildDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise)
  const { language } = useLanguage()
  const { user } = useUser()

  if (params.id === "new") {
    return null
  }

  const isParent = user?.role === "parent"

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={isParent ? "/dashboard" : "/dashboard/children"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("children.title", language)}</h1>
          <p className="text-muted-foreground">{t("children.subtitle", language)}</p>
        </div>
      </div>

      {isParent ? (
        <ParentChildDetails childId={params.id} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ChildProfile childId={params.id} />
          </div>
          <div className="lg:col-span-2">
            <VaccinationHistory childId={params.id} />
          </div>
        </div>
      )}
    </div>
  )
}
