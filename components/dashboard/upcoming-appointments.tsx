"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useRouter } from "next/navigation"

export function UpcomingAppointments() {
  const { language } = useLanguage()
  const router = useRouter()

  const appointments: any[] = []

  const handleViewAppointment = (appointmentId: number) => {
    router.push(`/dashboard/appointments`)
  }

  const handleShowAllAppointments = () => {
    router.push(`/dashboard/appointments`)
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        {t("dashboard.appointments.upcomingAppointments", language)}
      </h3>
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center gap-3 pb-4 border-b border-border last:border-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">{appointment.child}</p>
                <p className="text-xs text-muted-foreground">
                  {appointment.vaccine} • {appointment.date}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.appointments.guardian", language)}: {appointment.guardian}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleViewAppointment(appointment.id)}>
                {t("dashboard.appointments.view", language)}
              </Button>
            </div>
          ))
        )}
      </div>
      <Button className="w-full mt-4" onClick={handleShowAllAppointments} disabled={appointments.length === 0}>
        {t("dashboard.appointments.showAll", language)}
      </Button>
    </Card>
  )
}
