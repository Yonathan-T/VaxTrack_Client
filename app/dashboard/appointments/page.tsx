"use client"

import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { AppointmentsList } from "@/components/appointments/appointments-list"
import { AppointmentStats } from "@/components/appointments/appointment-stats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useState } from "react"
import { RoleProtected } from "@/lib/role-protected"
import { useUser } from "@/lib/user-context"

export default function AppointmentsPage() {
  const { language } = useLanguage()
  const { user } = useUser()
  const [selectedDate, setSelectedDate] = useState<number>(15)

  const canSchedule = user?.role === "healthcare_worker" || user?.role === "administrator"

  return (
    <RoleProtected allowedRoles={["healthcare_worker", "woreda_officer", "administrator"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("appointments.title", language)}</h1>
            <p className="text-muted-foreground">{t("appointments.subtitle", language)}</p>
          </div>
          {canSchedule && (
            <Link href="/dashboard/appointments/schedule">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("appointments.scheduleAppointment", language)}
              </Button>
            </Link>
          )}
        </div>

        <AppointmentStats />

        <div className="space-y-6">
          <div className="w-1/2">
            <AppointmentCalendar onDateSelect={setSelectedDate} selectedDate={selectedDate} />
          </div>

          <div>
            <AppointmentsList selectedDate={selectedDate} />
          </div>
        </div>
      </div>
    </RoleProtected>
  )
}
