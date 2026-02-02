"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Phone, MessageSquare, CheckCircle, RefreshCw, Loader2, Eye, Calendar, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  getAppointmentsList,
  getChildProfile,
  getAppointmentDetails,
  updateAppointment,
  cancelAppointment,
  Appointment as ApiAppointment
} from "@/lib/healthcare-worker-api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/lib/user-context"

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
  status?: "scheduled" | "completed" | "missed" | "rescheduled" | "confirmed" | "pending" | "checked-in" | "cancelled"
  dateTime?: string
  scheduled_date?: string
  scheduled_at?: string
  appointment_date?: string
}

interface AppointmentsListProps {
  selectedDate?: Date
}

export function AppointmentsList({ selectedDate }: AppointmentsListProps) {
  const languageContext = useLanguage()
  const language = languageContext.language
  const { user } = useUser()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [callDialogOpen, setCallDialogOpen] = useState(false)
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointmentDetails, setAppointmentDetails] = useState<ApiAppointment | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSendingSMS, setIsSendingSMS] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")

  // Check if user can manage appointments - only healthcare workers can reschedule/cancel/checkin
  const canManageAppointments = user?.role === "healthcare_worker"

  const fetchAppointments = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const params: any = {}
      if (searchQuery) params.search = searchQuery
      if (selectedDate) {
        // Format date to local YYYY-MM-DD to match the API expectation
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.getDate()).padStart(2, '0')
        params.date = `${year}-${month}-${day}`
      }

      const response = await getAppointmentsList(params)

      if (response.error) {
        console.log("[v0] Error fetching appointments:", response.error)
        setAppointments([])
        return
      }

      if (response.data) {
        // Handle API response structure
        const appointmentsData = response.data as any
        const appointmentsArray = Array.isArray(appointmentsData?.data)
          ? appointmentsData.data
          : Array.isArray(appointmentsData?.appointments)
            ? appointmentsData.appointments
            : Array.isArray(appointmentsData)
              ? appointmentsData
              : []

        console.log("[AppointmentsList] Fetched appointments:", appointmentsArray.length)

        // Transform API appointments to match our interface
        const enrichedAppointments = await Promise.all(
          appointmentsArray.map(async (apt: any) => {
            try {
              const childId = apt.child_id || apt.childId || apt.child?.id
              const scheduledDate = apt.scheduled_at || apt.scheduled_date || apt.appointment_date || apt.dateTime

              let childName = apt.child?.first_name && apt.child?.last_name
                ? `${apt.child.first_name} ${apt.child.last_name}`
                : apt.childName || "-"

              let guardianName = apt.child?.parent?.name || "-"
              let phone = apt.child?.parent?.phone || "-"

              // Fetch child details if we have childId but no child data
              if (childId && !apt.child) {
                try {
                  const childProfile = await getChildProfile(childId.toString())
                  const childData = childProfile.data as any
                  if (childData) {
                    childName = childData.first_name && childData.last_name
                      ? `${childData.first_name} ${childData.last_name}`
                      : childData.name || childName
                    guardianName = childData.parent?.name || childData.contact?.guardianName || guardianName
                    phone = childData.parent?.phone || childData.contact?.guardianPhone || phone
                  }
                } catch (err) {
                  console.log("[AppointmentsList] Error fetching child:", err)
                }
              }

              let vaccineName = apt.vaccine?.name || apt.appointmentType

              if (!vaccineName && Array.isArray(apt.vaccination_records) && apt.vaccination_records.length > 0) {
                vaccineName = apt.vaccination_records.map((r: any) => r.vaccine?.name).filter(Boolean).join(", ")
              }

              if (!vaccineName) vaccineName = "-"

              const appointmentDate = scheduledDate ? new Date(scheduledDate) : null

              return {
                ...apt,
                id: apt.id?.toString() || Date.now().toString(),
                childId: childId?.toString(),
                childName,
                guardianName,
                phone,
                vaccine: vaccineName,
                appointmentType: vaccineName,
                dateTime: scheduledDate,
                time: appointmentDate
                  ? appointmentDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  : "-",
                status: apt.status || "scheduled",
              }
            } catch (err) {
              console.log("[AppointmentsList] Error enriching appointment:", err)
              return {
                ...apt,
                id: apt.id?.toString() || Date.now().toString(),
                childName: apt.childName || "-",
                guardianName: "-",
                phone: "-",
                vaccine: apt.vaccine?.name || apt.appointmentType || "-",
                appointmentType: apt.vaccine?.name || apt.appointmentType || "-",
                time: apt.scheduled_at || apt.scheduled_date || apt.appointment_date || apt.dateTime
                  ? new Date(apt.scheduled_at || apt.scheduled_date || apt.appointment_date || apt.dateTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  : "-",
                status: apt.status || "scheduled",
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

  const handleSendSMS = async (appointment: Appointment) => {
    let phoneNumber = appointment.phone || appointment.guardianPhone || ""
    const childId = appointment.childId || ""
    
    // Format phone number: remove first digit (0) and add +251 prefix
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "+251" + phoneNumber.slice(1)
    } else if (!phoneNumber.startsWith("+251")) {
      phoneNumber = "+251" + phoneNumber
    }
    
    if (!phoneNumber) {
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ስልክ ቁጥር አልተገኘም" : "No phone number found",
        variant: "destructive",
      })
      return
    }

    if (!childId) {
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "የህፃን ID አልተገኘም" : "Child ID not found",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSendingSMS(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vaxtrackapi.onrender.com/api'
      const token = localStorage.getItem('authToken')
      
      const fullUrl = `${baseUrl}/v1/send-sms/${phoneNumber}/${childId}`
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseText = await response.text()
      
      // Try to parse JSON, fallback to text if not valid JSON
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Response not JSON:", responseText)
        throw new Error('Invalid response from server')
      }
      
      if (result.success) {
        toast({
          title: language === "am" ? "ተሳክታል" : "Success",
          description: language === "am" 
            ? `ለ ${appointment.guardian || appointment.guardianName || 'ወላጅ'} መልእክት ተልኳል` 
            : `Notification sent to ${appointment.guardian || appointment.guardianName || 'parent'}`,
        })
      } else {
        throw new Error(result.message || 'SMS sending failed')
      }
    } catch (error) {
      console.error("Error sending SMS:", error)
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "መልእክት መላክ አልተቻለም" : "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setIsSendingSMS(false)
    }
  }

  const confirmCall = async () => {
    if (!selectedAppointment) return

    try {
      setIsProcessing(true)
      const guardianPhone = selectedAppointment.phone || selectedAppointment.guardianPhone || ""
      const guardianName = selectedAppointment.guardian || selectedAppointment.guardianName || ""

      console.log("[v0] Calling appointment:", selectedAppointment.id)

      toast({
        title: t("appointments.call", language) || "Call",
        description: `${t("appointments.calling", language) || "Calling"} ${guardianName} at ${guardianPhone}`,
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

      console.log("[AppointmentsList] Appointment checked in:", selectedAppointment.id)

      toast({
        title: t("appointments.checkIn", language) || "Check In",
        description: `${childName} has been checked in for ${vaccine}`,
        variant: "default",
      })
    } finally {
      setIsProcessing(false)
      setCheckinDialogOpen(false)
    }
  }

  const handleViewDetails = async (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsLoadingDetails(true)
    setDetailDialogOpen(true)

    try {
      const response = await getAppointmentDetails(appointment.id)
      if (response.error) {
        console.error("[AppointmentsList] Error fetching appointment details:", response.error)
        toast({
          title: t("common.error", language) || "Error",
          description: response.error.message || "Failed to load appointment details",
          variant: "destructive",
        })
      } else {
        const details = (response.data as any)?.data || response.data
        setAppointmentDetails(details)
      }
    } catch (error) {
      console.error("[AppointmentsList] Error:", error)
      toast({
        title: t("common.error", language) || "Error",
        description: "Failed to load appointment details",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    const aptDate = appointment.dateTime || appointment.scheduled_date || appointment.appointment_date
    if (aptDate) {
      const date = new Date(aptDate)
      setNewDate(date.toISOString().split('T')[0])
      setNewTime(date.toTimeString().slice(0, 5))
    }
    setRescheduleDialogOpen(true)
  }

  const confirmReschedule = async () => {
    if (!selectedAppointment || !newDate) return

    try {
      setIsProcessing(true)
      const response = await updateAppointment(selectedAppointment.id, {
        scheduled_date: newTime ? `${newDate} ${newTime}` : newDate,
        status: "rescheduled",
      })

      if (response.error) {
        toast({
          title: t("common.error", language) || "Error",
          description: response.error.message || "Failed to reschedule appointment",
          variant: "destructive",
        })
        return
      }

      toast({
        title: t("appointments.rescheduled", language) || "Appointment Rescheduled",
        description: "Appointment has been rescheduled successfully",
        variant: "default",
      })

      // Refresh appointments
      await fetchAppointments(true)
      setRescheduleDialogOpen(false)
    } catch (error) {
      console.error("[AppointmentsList] Error rescheduling:", error)
      toast({
        title: t("common.error", language) || "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setCancelDialogOpen(true)
  }

  const confirmCancel = async () => {
    if (!selectedAppointment) return

    try {
      setIsProcessing(true)
      const response = await cancelAppointment(selectedAppointment.id)

      if (response.error) {
        toast({
          title: t("common.error", language) || "Error",
          description: response.error.message || "Failed to cancel appointment",
          variant: "destructive",
        })
        return
      }

      toast({
        title: t("appointments.cancelled", language) || "Appointment Cancelled",
        description: "Appointment has been cancelled successfully",
        variant: "default",
      })

      // Refresh appointments
      await fetchAppointments(true)
      setCancelDialogOpen(false)
    } catch (error) {
      console.error("[AppointmentsList] Error cancelling:", error)
      toast({
        title: t("common.error", language) || "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const isCheckedIn = (appointmentId: string) => {
    return appointments.find((apt) => apt.id === appointmentId)?.status === "checked-in"
  }

  const filteredAppointments = appointments.filter((appointment) => {
    // Filter by selected date if provided
    if (selectedDate) {
      const aptDate = appointment.scheduled_at || appointment.dateTime || appointment.scheduled_date || appointment.appointment_date
      if (aptDate) {
        const appointmentDate = new Date(aptDate)
        const isSameDate =
          appointmentDate.getDate() === selectedDate.getDate() &&
          appointmentDate.getMonth() === selectedDate.getMonth() &&
          appointmentDate.getFullYear() === selectedDate.getFullYear()

        if (!isSameDate) return false
      } else {
        return false // No date on appointment, exclude if filtering by date
      }
    }

    // Filter by search query
    if (searchQuery) {
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
    }

    return true
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
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
                <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap min-w-[280px]">
                  {t("dashboard.actions.view", language) || "Actions"}
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
                        {appointment.childName || "-"}
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
                              ? t("appointments.confirmed", language) || "Confirmed"
                              : t("appointments.pending", language) || "Pending"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 bg-transparent"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            <Eye className="h-3 w-3" />
                            {t("common.view", language) || "View"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 bg-transparent"
                            onClick={() => handleCallClick(appointment)}
                            disabled={true}
                          >
                            <Phone className="h-3 w-3" />
                            {t("appointments.call", language) || "Call"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 bg-transparent"
                            onClick={() => handleSendSMS(appointment)}
                            disabled={isSendingSMS || !appointment.phone && !appointment.guardianPhone || !appointment.childId}
                          >
                            <MessageSquare className="h-3 w-3" />
                            {isSendingSMS ? "Sending..." : (language === "am" ? "እቀብል SMS" : "Send SMS")}
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
                ? `${t("appointments.calling", language) || "Calling"} ${selectedAppointment.guardianName || "-"} at ${selectedAppointment.phone || selectedAppointment.guardianPhone || "-"}?`
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
                ? `Confirm check-in for ${selectedAppointment.childName || "-"} for ${selectedAppointment.vaccine || selectedAppointment.appointmentType || ""}?`
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

      {/* Appointment Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === "am" ? "የማስጠኛ ዝርዝር" : "Appointment Details"}</DialogTitle>
            <DialogDescription>
              {language === "am" ? "ሙሉ የማስጠኛ መረጃ ይመልከቱ" : "View full appointment information"}
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : appointmentDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === "am" ? "ህፃን" : "Child"}</Label>
                  <p className="font-medium">
                    {appointmentDetails.child?.first_name && appointmentDetails.child?.last_name
                      ? `${appointmentDetails.child.first_name} ${appointmentDetails.child.last_name}`
                      : selectedAppointment?.childName || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === "am" ? "ክችል" : "Vaccine"}</Label>
                  <p className="font-medium">{appointmentDetails.vaccine?.name || selectedAppointment?.vaccine || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === "am" ? "የማስጠኛ ቀን" : "Appointment Date"}</Label>
                  <p className="font-medium">
                    {appointmentDetails.scheduled_date || appointmentDetails.appointment_date || selectedAppointment?.scheduled_at
                      ? new Date((appointmentDetails.scheduled_date || appointmentDetails.appointment_date || selectedAppointment?.scheduled_at) as string).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === "am" ? "ሰዓት" : "Time"}</Label>
                  <p className="font-medium">
                    {appointmentDetails.scheduled_date || appointmentDetails.appointment_date || selectedAppointment?.scheduled_at
                      ? new Date((appointmentDetails.scheduled_date || appointmentDetails.appointment_date || selectedAppointment?.scheduled_at) as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : selectedAppointment?.time || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === "am" ? "ሁኔታ" : "Status"}</Label>
                  <Badge variant="secondary" className="mt-1">
                    {appointmentDetails.status || "-"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === "am" ? "ዋላጅ" : "Guardian"}</Label>
                  <p className="font-medium">
                    {appointmentDetails.child?.parent?.name || selectedAppointment?.guardianName || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === "am" ? "ስልክ" : "Phone"}</Label>
                  <p className="font-medium font-mono">
                    {appointmentDetails.child?.parent?.phone || selectedAppointment?.phone || selectedAppointment?.guardianPhone || "-"}
                  </p>
                </div>
                {appointmentDetails.facility && (
                  <div>
                    <Label className="text-muted-foreground">{language === "am" ? "ተቋራጭ" : "Facility"}</Label>
                    <p className="font-medium">{appointmentDetails.facility.name || "-"}</p>
                  </div>
                )}
              </div>
              {appointmentDetails.notes && (
                <div>
                  <Label className="text-muted-foreground">{language === "am" ? "ማስታውታዎች" : "Notes"}</Label>
                  <p className="mt-1 text-sm">{appointmentDetails.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t("common.noData", language) || "No details available"}
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "am" ? "ማስጠኛ እንደገና" : "Reschedule Appointment"}</DialogTitle>
            <DialogDescription>
              {selectedAppointment
                ? `${language === "am" ? "ለ" : "Reschedule appointment for"} ${selectedAppointment.childName || "-"}${language === "am" ? " ማስጠኛ እንደገና" : ""}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newDate">{language === "am" ? "አዲስ ቀን" : "New Date"}</Label>
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newTime">{t("appointments.newTime", language) || "New Time"}</Label>
              <Input
                id="newTime"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
                {t("common.cancel", language) || "Cancel"}
              </Button>
              <Button onClick={confirmReschedule} disabled={isProcessing || !newDate}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("common.processing", language) || "Processing..."}
                  </>
                ) : (
                  language === "am" ? "ማስጠኛ እንደገና" : "Reschedule"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === "am" ? "ቀጠሮውን ሰርዝ" : "Cancel Appointment"}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAppointment
                ? `${t("appointments.cancelConfirm", language) || "Are you sure you want to cancel the appointment for"} ${selectedAppointment.childName || "-"}? This action cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>{t("common.cancel", language) || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} disabled={isProcessing} className="bg-destructive hover:bg-destructive/90">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.processing", language) || "Processing..."}
                </>
              ) : (
                language === "am" ? "ቀጠሮውን ሰርዝ" : "Cancel Appointment"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
