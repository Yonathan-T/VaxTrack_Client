"use client"

import { RecordVaccinationForm } from "@/components/vaccinations/record-vaccination-form"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { RoleProtected } from "@/lib/role-protected"

export default function RecordVaccinationPage() {
  const { language } = useLanguage()

  return (
    <RoleProtected allowedRoles={["healthcare_worker", "administrator"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vaccinations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === "am" ? "ክትባት ይመዝግቡ" : "Record Vaccination"}
            </h1>
            <p className="text-muted-foreground">
              {language === "am"
                ? "ክትባት ሰጭውን ሰነድ እና የልጆች መዝገብ ያሻሽሉ"
                : "Document administered vaccine and update child's record"}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <RecordVaccinationForm />
        </Card>
      </div>
    </RoleProtected>
  )
}
