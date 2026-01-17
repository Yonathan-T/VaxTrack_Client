"use client"

import { ScheduleAppointmentForm } from "@/components/appointments/schedule-appointment-form"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { RoleProtected } from "@/lib/role-protected"

export default function ScheduleAppointmentPage() {
  const { language } = useLanguage()

  return (
    <RoleProtected allowedRoles={["healthcare_worker", "administrator"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/appointments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === "am" ? "ስብሰባ ያስወስኑ" : "Schedule Appointment"}
            </h1>
            <p className="text-muted-foreground">
              {language === "am" ? "አዲስ የክትባት ስብሰባ ፍጠር" : "Create a new vaccination appointment"}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <ScheduleAppointmentForm />
        </Card>
      </div>
    </RoleProtected>
  )
}
