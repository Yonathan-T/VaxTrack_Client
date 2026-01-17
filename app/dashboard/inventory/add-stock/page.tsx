"use client"

import { AddStockForm } from "@/components/inventory/add-stock-form"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { RoleProtected } from "@/lib/role-protected"

export default function AddStockPage() {
  const { language } = useLanguage()

  return (
    <RoleProtected allowedRoles={["nurse", "administrator"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === "am" ? "ክትባት ክምችት ጨምር" : "Add Vaccine Stock"}
            </h1>
            <p className="text-muted-foreground">
              {language === "am" ? "ተቀበለውን አዲስ ክትባት ክምችት ይመዝግቡ" : "Record new vaccine inventory received"}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <AddStockForm />
        </Card>
      </div>
    </RoleProtected>
  )
}
