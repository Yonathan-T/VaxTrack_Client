"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle2, AlertCircle, Calendar, Clock, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { t } from "@/lib/translations"
import { getChildProfile, type ChildProfile } from "@/lib/healthcare-worker-api"
import { RecordVaccinationModal } from "./record-vaccination-modal"
import { ScheduleAppointmentModal } from "./schedule-appointment-modal"
import { useToast } from "@/hooks/use-toast"

export function VaccinationHistory({ childId }: { childId: string }) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const { user } = useUser()
  const [isRecordOpen, setIsRecordOpen] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [selectedVaccine, setSelectedVaccine] = useState<any>(null)
  const [childData, setChildData] = useState<ChildProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVaccinationRecord, setSelectedVaccinationRecord] = useState<any>(null)

  // Helper: precise age formatting (months if < 1 year, otherwise years)
  const formatAge = (dob?: string) => {
    if (!dob) return ""
    const birth = new Date(dob)
    const now = new Date()
    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    const days = now.getDate() - birth.getDate()
    if (days < 0) months -= 1
    if (months < 0) {
      years -= 1
      months += 12
    }
    if (years <= 0) return `${Math.max(0, months)} months old`
    return `${years} year${years > 1 ? "s" : ""} old`
  }

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        setIsLoading(true)
        const response = await getChildProfile(childId)

        if (response.error) {
          toast({
            title: "Error",
            description: response.error.message || "Failed to load vaccination history",
            variant: "destructive",
          })
          return
        }

        if (response.data) {
          setChildData(response.data as any)
        }
      } catch (error) {
        console.error("[VaccinationHistory] Error:", error)
        toast({
          title: "Error",
          description: "Failed to load vaccination history",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchChildData()
  }, [childId, toast])

  const completedVaccinations = childData?.vaccination_records?.filter(
    (record: any) => (record as any).status === "completed" && (((record as any).date_administered) || ((record as any).dateAdministered)),
  ) || []

  const dueVaccinations = childData?.vaccination_records?.filter(
    (record: any) => (record as any).status === "scheduled" || (record as any).status === "overdue",
  ) || []

  const handleRecordVaccination = (vaccinationRecord: any) => {
    setSelectedVaccinationRecord(vaccinationRecord)
    setIsRecordOpen(true)
  }

  const handleSchedule = (vaccine: any) => {
    setSelectedVaccine(vaccine)
    setIsScheduleOpen(true)
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="space-y-3 w-full max-w-2xl">
            <div className="h-24 bg-muted animate-pulse rounded-lg" />
            <div className="h-24 bg-muted animate-pulse rounded-lg" />
            <div className="h-24 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Completed Vaccinations */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {t("vaccinations.title", language) || "Vaccination History"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Completed vaccinations for this child
              </p>
              {(childData?.date_of_birth || (childData as any)?.dateOfBirth) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {(childData?.first_name || childData?.last_name) ? `${childData?.first_name ?? ""} ${childData?.last_name ?? ""}`.trim() : (childData as any)?.name || ""}
                  {" \u00B7 "}
                  {formatAge((childData as any)?.date_of_birth || (childData as any)?.dateOfBirth)}
                </p>
              )}
            </div>
            {user?.role === "healthcare_worker" && (
              <Button size="sm" onClick={() => setIsRecordOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("vaccinations.recordVaccination", language) || "Record Vaccination"}
              </Button>
            )}
          </div>

          {completedVaccinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                {t("vaccinations.noRecords", language) || "No vaccination records found"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("vaccinations.startRecordingVaccinations", language) ||
                  "Start recording vaccinations to track this child's immunization history"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedVaccinations.map((record: any) => (
                <div
                  key={record.id}
                  className="border border-border rounded-lg p-5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">
                          {record.vaccine?.name || record.vaccineName || "Unknown Vaccine"}
                        </h4>
                        {record.vaccine?.description && (
                          <p className="text-sm text-muted-foreground mt-1">{record.vaccine.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      {t("vaccinations.completed", language) || "Completed"}
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">{t("vaccinations.dateAdministered", language) || "Date Administered"}</p>
                      <p className="font-medium text-foreground">
                        {((record as any).date_administered || (record as any).dateAdministered)
                          ? new Date(((record as any).date_administered || (record as any).dateAdministered)).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">{t("vaccinations.batchNumber", language) || "Batch Number"}</p>
                      <p className="font-medium text-foreground font-mono">{(record as any).batch_number || (record as any).batchNumber || "-"}</p>
                    </div>
                    {(record.administer?.name || record.user?.name || record.administered_by_name || record.administered_by || record.administeredBy) && (
                      <div>
                        <p className="text-muted-foreground mb-1">{t("vaccinations.administeredBy", language) || "Administered By"}</p>
                        <p className="font-medium text-foreground">
                          {record.administer?.name ||
                            record.user?.name ||
                            (record as any).administered_by_name ||
                            // If backend returns only an ID and it matches current user, show current user's name
                            ((String((record as any).administered_by ?? (record as any).administeredBy) === String(user?.id))
                              ? (user?.name || user?.email || String((record as any).administered_by || (record as any).administeredBy))
                              : ((record as any).administered_by || (record as any).administeredBy)) ||
                            "-"}
                        </p>
                      </div>
                    )}
                    {(record as any).dose_number && (
                      <div>
                        <p className="text-muted-foreground mb-1">Dose Number</p>
                        <p className="font-medium text-foreground">Dose {(record as any).dose_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Due/Upcoming Vaccinations */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Due & Upcoming Vaccinations
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Vaccines scheduled or overdue for this child
              </p>
            </div>
          </div>

          {dueVaccinations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No upcoming vaccinations scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dueVaccinations.map((record: any) => {
                const scheduledDate = (record as any).scheduled_date || (record as any).scheduledDate
                  ? new Date((record as any).scheduled_date || (record as any).scheduledDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "-"
                const isOverdue = (record as any).status === "overdue"

                return (
                  <div
                    key={record.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${isOverdue
                      ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                      : "bg-muted/50 border-border"
                      }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${isOverdue
                          ? "bg-red-100 dark:bg-red-900/20"
                          : "bg-orange-100 dark:bg-orange-900/20"
                          }`}
                      >
                        <Calendar
                          className={`h-6 w-6 ${isOverdue ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"
                            }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">
                            {record.vaccine?.name || record.vaccineName || "Unknown Vaccine"}
                          </p>
                          <Badge variant={isOverdue ? "destructive" : "secondary"}>
                            {isOverdue ? "Overdue" : "Scheduled"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {scheduledDate}
                          </span>
                          {record.vaccine?.code && (
                            <span className="font-mono text-xs">{record.vaccine.code}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {user?.role === "healthcare_worker" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={isOverdue ? "default" : "outline"}
                          onClick={() => handleRecordVaccination(record)}
                        >
                          Record Now
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSchedule(record)}>
                          Reschedule
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <RecordVaccinationModal
        isOpen={isRecordOpen}
        onClose={() => {
          setIsRecordOpen(false)
          setSelectedVaccinationRecord(null)
        }}
        childId={childId}
        vaccinationRecord={selectedVaccinationRecord}
      />
      <ScheduleAppointmentModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        vaccine={selectedVaccine}
      />
    </>
  )
}
