"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useVaccinations } from "@/lib/vaccinations-context"
import { RecordVaccinationModal } from "./record-vaccination-modal"
import { ScheduleAppointmentModal } from "./schedule-appointment-modal"

export function VaccinationHistory({ childId }: { childId: string }) {
  const { language } = useLanguage()
  const { vaccinations } = useVaccinations()
  const [isRecordOpen, setIsRecordOpen] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [selectedVaccine, setSelectedVaccine] = useState<any>(null)

  const childVaccinations = vaccinations.filter((v) => v.childId === childId && v.status === "completed")

  const upcomingVaccinations = [
    {
      vaccine: "Penta 2",
      dueDate: "2024-06-15",
      status: "upcoming",
    },
    {
      vaccine: "OPV 2",
      dueDate: "2024-06-15",
      status: "upcoming",
    },
  ]

  const handleSchedule = (vaccine: any) => {
    setSelectedVaccine(vaccine)
    setIsScheduleOpen(true)
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{t("vaccinations.title", language)}</h3>
            <Button size="sm" onClick={() => setIsRecordOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("vaccinations.recordVaccination", language)}
            </Button>
          </div>

          {childVaccinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{t("vaccinations.noRecords", language)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("vaccinations.startRecordingVaccinations", language)}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {childVaccinations.map((vaccination) => (
                <div key={vaccination.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                      <h4 className="font-semibold text-foreground">{vaccination.vaccine}</h4>
                    </div>
                    <Badge variant="default">{t("vaccinations.completed", language)}</Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("vaccinations.dateAdministered", language)}</p>
                      <p className="font-medium text-foreground">{vaccination.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("vaccinations.batchNumber", language)}</p>
                      <p className="font-medium text-foreground">{vaccination.batchNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Facility</p>
                      <p className="font-medium text-foreground">{vaccination.facility}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("vaccinations.administeredBy", language)}</p>
                      <p className="font-medium text-foreground">{vaccination.administeredBy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("vaccinations.stats.nextSevenDays", language)}
          </h3>
          <div className="space-y-3">
            {upcomingVaccinations.map((vaccination, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{vaccination.vaccine}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("form.dueDate", language)}: {vaccination.dueDate}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleSchedule(vaccination)}>
                  {t("appointments.scheduleAppointment", language)}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <RecordVaccinationModal isOpen={isRecordOpen} onClose={() => setIsRecordOpen(false)} childId={childId} />
      <ScheduleAppointmentModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        vaccine={selectedVaccine}
      />
    </>
  )
}
