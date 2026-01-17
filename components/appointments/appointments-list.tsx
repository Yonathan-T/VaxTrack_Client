"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Phone, CheckCircle, RefreshCw } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { getAppointmentsList, getChildProfile } from "@/lib/healthcare-worker-api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Appointment {
  id: string
  childId?: string
  childName?: string
  time?: string
  child?: string
  vaccine?: string
  appointmentType?: string
  guardian?: string
  guardianName?: string
  phone?: string
  guardianPhone?: string
  status?: "scheduled" | "completed" | "missed" | "rescheduled" | "confirmed" | "pending" | "checked-in"
  dateTime?: string
}

interface AppointmentsListProps {
  selectedDate?: number
}

export function AppointmentsList({ selectedDate }: AppointmentsListProps) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [callDialogOpen, setCallDialogOpen] = useState(false)
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchAppointments = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await getAppointmentsList()

      if (response.error) {
        console.log("[v0] Error fetching appointments:", response.error)
        setAppointments([])
        return
      }

      if (response.data) {
        // Handle both { appointments: [] } and raw array responses
        const appointmentsData = (response.data as any).appointments || response.data || []
        const appointmentsArray = Array.isArray(appointmentsData) ? appointmentsData : []

        console.log("[v0] Fetched appointments:", appointmentsArray.length)

        // Fetch child details for each appointment to get guardian and phone info
        const enrichedAppointments = await Promise.all(
          appointmentsArray.map(async (apt: any) => {
            try {
              if (!apt.childId) {
                return {
                  ...apt,
                  childName: apt.childName || "-",
                  guardianName: "-",
                  phone: "-",
                  vaccine: apt.appointmentType || "-",
                  time: apt.dateTime
                    ? new Date(apt.dateTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "-",
                  status: apt.status === "scheduled" ? "pending" : apt.status,
                }
              }

              const childProfile = await getChildProfile(apt.childId)
              const childData = childProfile.data as any

              return {
                ...apt,
                childName: apt.childName || childData?.name || "-",
                guardianName: childData?.contact?.guardianName || "-",
                phone: childData?.contact?.guardianPhone || "-",
                vaccine: apt.appointmentType || "-",
                time: apt.dateTime
                  ? new Date(apt.dateTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "-",
                status: apt.status === "scheduled" ? "pending" : apt.status,
              }
            } catch (err) {
              console.log("[v0] Error enriching appointment:", err)
              return {
                ...apt,
                childName: apt.childName || "-",
                guardianName: "-",
                phone: "-",
                vaccine: apt.appointmentType || "-",
                time: apt.dateTime
                  ? new Date(apt.dateTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "-",
                status: apt.status === "scheduled" ? "pending" : apt.status,
              }
            }
          }),
        )

        setAppointments(enrichedAppointments)
      } else {
        setAppointments([])
      }
    } catch (error) {
      console.log("[v0] Error in fetchAppointments:", error)
      setAppointments([])
    } finally {
      if (showRefreshIndicator) {
        setIsRefreshing(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchAppointments()

    const refreshInterval = setInterval(() => {
      fetchAppointments(true)
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [selectedDate])

  const handleRefresh = () => {
    fetchAppointments(true)
  }

  const handleCallClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setCallDialogOpen(true)
  }

  const confirmCall = async () => {
    if (!selectedAppointment) return

    try {
      setIsProcessing(true)
      const guardianPhone = selectedAppointment.phone || selectedAppointment.guardianPhone || ""
      const guardianName = selectedAppointment.guardian || selectedAppointment.guardianName || ""

      console.log("[v0] Calling appointment:", selectedAppointment.id)

      toast({
        title: t("appointments.call", language),
        description: `${t("appointments.calling", language)} ${guardianName} at ${guardianPhone}`,
        variant: "default",
      })
    } finally {
      setIsProcessing(false)
      setCallDialogOpen(false)
    }
  }

  const handleCheckinClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setCheckinDialogOpen(true)
  }

  const confirmCheckin = async () => {
    if (!selectedAppointment) return

    try {
      setIsProcessing(true)

      const childName = selectedAppointment.child || selectedAppointment.childName || ""
      const vaccine = selectedAppointment.vaccine || selectedAppointment.appointmentType || ""

      setAppointments((prev) =>
        prev.map((apt) => (apt.id === selectedAppointment.id ? { ...apt, status: "checked-in" } : apt)),
      )

      console.log("[v0] Appointment checked in:", selectedAppointment.id)

      toast({
        title: t("appointments.checkIn", language),
        description: `${childName} has been checked in for ${vaccine}`,
        variant: "default",
      })
    } finally {
      setIsProcessing(false)
      setCheckinDialogOpen(false)
    }
  }

  const isCheckedIn = (appointmentId: string) => {
    return appointments.find((apt) => apt.id === appointmentId)?.status === "checked-in"
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const searchLower = searchQuery.toLowerCase()
    const childName = (appointment.child || appointment.childName || "").toLowerCase()
    const guardianName = (appointment.guardian || appointment.guardianName || "").toLowerCase()
    const vaccine = (appointment.vaccine || appointment.appointmentType || "").toLowerCase()
    const phone = appointment.phone || appointment.guardianPhone || ""

    return (
      childName.includes(searchLower) ||
      guardianName.includes(searchLower) ||
      vaccine.includes(searchLower) ||
      phone.includes(searchLower)
    )
  })

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">{t("dashboard.loading", language)}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("appointments.searchPlaceholder", language) || "Search appointments..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 bg-transparent"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? "..." : "Refresh"}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b">
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[80px]">
                  {t("appointments.time", language) || "Time"}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[150px]">
                  {t("appointments.child", language) || "Child"}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[120px]">
                  {t("appointments.vaccine", language) || "Vaccine"}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[150px]">
                  {t("appointments.guardian", language) || "Guardian"}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[130px]">
                  {t("appointments.phone", language) || "Phone"}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[100px]">
                  {t("appointments.status", language) || "Status"}
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[220px]">
                  {t("dashboard.actions.actions", language) || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                    {t("appointments.noAppointments", language) || "No appointments found"}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => {
                  const checkedIn = isCheckedIn(appointment.id)
                  return (
                    <tr
                      key={appointment.id}
                      className={cn("border-b hover:bg-muted/50 transition-colors", checkedIn && "bg-green-50")}
                    >
                      <td className="px-3 py-2 font-medium text-foreground">
                        {appointment.time || new Date(appointment.dateTime || "").toLocaleTimeString()}
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground">
                        {appointment.child || appointment.childName || "-"}
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {appointment.vaccine || appointment.appointmentType || "-"}
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {appointment.guardian || appointment.guardianName || "-"}
                      </td>
                      <td className="px-3 py-2 text-foreground font-mono text-xs">
                        {appointment.phone || appointment.guardianPhone || "-"}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={checkedIn ? "default" : appointment.status === "confirmed" ? "default" : "secondary"}
                          className={cn("text-xs", checkedIn && "bg-green-600")}
                        >
                          {checkedIn
                            ? t("appointments.checkedIn", language) || "Checked In"
                            : appointment.status === "confirmed"
                              ? t("appointments.confirmed", language)
                              : t("appointments.pending", language)}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 bg-transparent"
                            onClick={() => handleCallClick(appointment)}
                            disabled={checkedIn}
                          >
                            <Phone className="h-3 w-3" />
                            {t("appointments.call", language) || "Call"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCheckinClick(appointment)}
                            disabled={checkedIn}
                            variant={checkedIn ? "secondary" : "default"}
                            className={cn("gap-1", checkedIn && "bg-green-600")}
                          >
                            {checkedIn ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                {t("appointments.checkedIn", language) || "Checked In"}
                              </>
                            ) : (
                              t("appointments.checkIn", language) || "Check In"
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("appointments.call", language) || "Call Guardian"}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAppointment
                ? `${t("appointments.calling", language)} ${selectedAppointment.guardian || selectedAppointment.guardianName} at ${selectedAppointment.phone || selectedAppointment.guardianPhone}?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>{t("common.cancel", language) || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCall} disabled={isProcessing}>
              {isProcessing ? "Calling..." : t("appointments.call", language) || "Call"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={checkinDialogOpen} onOpenChange={setCheckinDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("appointments.checkIn", language) || "Check In Appointment"}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAppointment
                ? `Confirm check-in for ${selectedAppointment.child || selectedAppointment.childName} for ${selectedAppointment.vaccine || selectedAppointment.appointmentType}?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>{t("common.cancel", language) || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCheckin} disabled={isProcessing}>
              {isProcessing ? "Processing..." : t("appointments.checkIn", language) || "Check In"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
