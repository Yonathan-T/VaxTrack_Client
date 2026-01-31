"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, AlertCircle, Info, MapPin, ClipboardList, Loader2, User } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { getChildDetails, getChildAppointments, type Child } from "@/lib/parent-api"

// Ethiopian Date Conversion Function
const getEthiopianDate = async (date: string, language: string) => {
  try {
    let gcDate: string = ""
    
    if (date.includes('/')) {
      const parts = date.split('/')
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0')
        const day = parts[1].padStart(2, '0')
        const year = parts[2]
        gcDate = `${year}-${month}-${day}`
      }
    } else if (date.includes('T')) {
      const utcDate = new Date(date)
      const ethiopianDateObj = new Date(utcDate.getTime() + (3 * 60 * 60 * 1000)) // Add 3 hours for Ethiopia
      gcDate = ethiopianDateObj.toISOString().split('T')[0]
    } else if (date.length === 10 && date.includes('-')) {
      gcDate = date
    } else {
      const dateObj = new Date(date)
      gcDate = dateObj.toISOString().split('T')[0]
    }
    
    const response = await fetch(`https://api.ethioall.com/convert/api?gc=${gcDate}`)
    const data = await response.json()
    
    if (data && data.length > 0) {
      const ethDate = data[0]
      const monthName = language === "en" ? ethDate.month_name.english : ethDate.month_name.amharic
      const dayName = language === "en" ? ethDate.day_name.english : ethDate.day_name.amharic
      
      return {
        date: `${ethDate.day} ${monthName} ${ethDate.year}`,
        dayName: dayName,
        fullDate: `${dayName}, ${ethDate.day} ${monthName} ${ethDate.year}`
      }
    }
  } catch (error) {
    console.error("Error converting to Ethiopian date:", error)
    const dateObj = new Date(date)
    const ethiopianYear = dateObj.getFullYear() - 8
    const fallbackMonth = language === "en" ? "የካቲት" : "የካቲት"
    const fallbackDay = language === "en" ? "ሐሙስ" : "ሐሙስ"
    
    return {
      date: `${dateObj.getDate()} ${fallbackMonth} ${ethiopianYear}`,
      dayName: fallbackDay,
      fullDate: `${fallbackDay}, ${dateObj.getDate()} ${fallbackMonth} ${ethiopianYear}`
    }
  }
  
  return null
}

const EthiopianDateConverter = ({ date, language }: { date: string | null | undefined, language: string }) => {
  const [ethiopianDate, setEthiopianDate] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const convertToEthiopian = async () => {
      if (!date) return
      
      setLoading(true)
      try {
        const result = await getEthiopianDate(date, language)
        if (result) {
          setEthiopianDate(result.fullDate)
        }
      } catch (error) {
        console.error("Error in Ethiopian date conversion:", error)
      } finally {
        setLoading(false)
      }
    }
    
    convertToEthiopian()
  }, [date, language])

  if (loading) {
    return <span className="text-xs text-muted-foreground">Loading...</span>
  }

  return <span className="text-xs text-muted-foreground">{ethiopianDate || "N/A"}</span>
}

interface ParentChildDetailsProps {
  childId: string
}

export function ParentChildDetails({ childId }: ParentChildDetailsProps) {
  const { language } = useLanguage()
  const [child, setChild] = useState<Child | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true)
      try {
        const [childResponse, appointmentsResponse] = await Promise.all([
          getChildDetails(childId),
          getChildAppointments(childId)
        ])

        if (childResponse.error) {
          setError(childResponse.error.message)
        } else if (childResponse.data) {
          setChild(childResponse.data)
        }

        if (appointmentsResponse.data) {
          const appointmentsData = appointmentsResponse.data as any
          setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
        }
      } catch (err) {
        setError("Failed to fetch child details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [childId])

  const vaccinationRecords = appointments.flatMap(apt => apt.vaccination_records || [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">{language === "am" ? "በመጫን ላይ..." : "Loading child details..."}</p>
      </div>
    )
  }

  if (error || !child) {
    return (
      <Card className="p-10 text-center border-red-100 bg-red-50/30">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-800">{language === "am" ? "ስህተት ተከስቷል" : "Error Occurred"}</h3>
        <p className="text-red-600 mt-2">{error || (language === "am" ? "ልጁ አልተገኘም" : "Child not found")}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-6 border-red-200 text-red-700 hover:bg-red-100">
          {language === "am" ? "እንደገና ይሞክሩ" : "Try Again"}
        </Button>
      </Card>
    )
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 1) {
      const months = today.getMonth() - birthDate.getMonth() + (12 * (today.getFullYear() - birthDate.getFullYear()))
      return language === "am" ? `${months} ወር` : `${months} month(s)`
    }

    return language === "am" ? `${age} ዓመት` : `${age} year(s)`
  }

  const hasOverdue = child.vaccination_records?.some(v => v.status === "overdue")

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="p-6 border-none shadow-sm bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-lg ring-4 ring-primary/10">
              {child.first_name.charAt(0)}
              {child.last_name.charAt(0)}
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                {child.first_name} {child.last_name}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 items-center text-muted-foreground">
                <span className="flex items-center gap-1.5 font-semibold text-primary/80">
                  <Calendar className="h-4 w-4" />
                  {language === "am" ? "እድሜ:" : "Age:"} {calculateAge(child.date_of_birth)}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
                <span className="font-medium">
                  {language === "am" ? "መታወቂያ:" : "ID:"} <span className="font-mono text-xs">{child.id}</span>
                </span>
              </div>
            </div>
          </div>

          <Badge className={`px-4 py-1.5 text-sm font-bold shadow-sm ${hasOverdue
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
            }`}>
            {hasOverdue
              ? (language === "am" ? "ክትባት ያለፈባቸው" : "Vaccines Overdue")
              : (language === "am" ? "ሁሉንም ክትባቶች ወስደዋል" : "Up to Date")}
          </Badge>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Vaccination Timeline */}
          <Card className="p-6 shadow-sm overflow-hidden border-border/50">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-foreground">
                {language === "am" ? "የክትባት የጊዜ መስመር" : "Vaccination Timeline"}
              </h3>
            </div>

            <div className="relative space-y-6">
              {/* Vertical line for timeline */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border hidden md:block" />

              {(!vaccinationRecords || vaccinationRecords.length === 0) ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground italic">
                    {language === "am" ? "ምንም የክትባት መረጃ የለም" : "No vaccination records found"}
                  </p>
                </div>
              ) : (
                vaccinationRecords.map((record, index) => {
                  const scheduledDate = record.scheduled_at ? new Date(record.scheduled_at).toLocaleDateString() : 
                    record.scheduled_date ? new Date(record.scheduled_date).toLocaleDateString() : 
                    record.due_date ? new Date(record.due_date).toLocaleDateString() : "Not scheduled"
                  
                  const scheduledTime = record.scheduled_at ? new Date(record.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                    record.scheduled_date ? new Date(record.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""
                  
                  // Calculate correct status based on today's date
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  
                  const scheduledDateObj = new Date(record.scheduled_at || record.scheduled_date)
                  scheduledDateObj.setHours(0, 0, 0, 0)
                  
                  let calculatedStatus = record.status
                  
                  // Override API status if it's wrong
                  if (record.status === "scheduled" && scheduledDateObj < today) {
                    calculatedStatus = "overdue"
                  }
                  
                  return (
                    <div key={record.id} className="relative pl-0 md:pl-10">
                      {/* Circle on timeline */}
                      <div className={`absolute left-2.5 md:left-2 -translate-x-1/2 top-2 h-4 w-4 rounded-full border-4 border-background shadow-sm hidden md:block z-10 ${calculatedStatus === "completed" ? "bg-green-500" :
                        calculatedStatus === "overdue" ? "bg-red-500" : "bg-blue-400"
                        }`} />

                      <div className={`p-4 rounded-xl border transition-all ${calculatedStatus === "completed" ? "bg-green-50/30 dark:bg-green-900/20 border-green-100 dark:border-green-700" :
                        calculatedStatus === "overdue" ? "bg-orange-50/30 dark:bg-orange-900/20 border-orange-100 dark:border-orange-700 shadow-sm ring-1 ring-orange-200 dark:ring-orange-800" :
                          "bg-muted/30 dark:bg-muted/20 border-border"
                        }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-bold text-foreground text-lg">{record.vaccine?.name || record.vaccineName || "Unknown Vaccine"}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {record.vaccine?.description || record.vaccineDescription || "Vaccination"}
                            </p>
                            <div className="flex flex-wrap gap-4 mt-3">
                              {record.date_administered ? (
                                <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {language === "am" ? "የተሰጠበት ቀን:" : "Administered:"} {new Date(record.date_administered).toLocaleDateString()}
                                </div>
                              ) : (
                                <div className={`text-xs px-2 py-0.5 rounded font-medium ${calculatedStatus === "overdue" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                }`}>
                                  {calculatedStatus === "overdue"
                                    ? (language === "am" ? "ካለፈበት ቀን:" : "Overdue since: ") + scheduledDate
                                    : (language === "am" ? "ቀጠሮ:" : "Scheduled: ") + scheduledDate + (scheduledTime ? ` at ${scheduledTime}` : "")
                                  }
                                </div>
                              )}
                              {calculatedStatus !== "completed" && scheduledTime && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Ethiopian Time: {(() => {
                                    const utcTime = new Date(record.scheduled_at || record.scheduled_date)
                                    const ethiopianTime = new Date(utcTime.getTime() + (3 * 60 * 60 * 1000))
                                    return ethiopianTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                                  })()}
                                </div>
                              )}
                              {calculatedStatus !== "completed" && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Ethiopian Date: <EthiopianDateConverter 
                                    date={record.scheduled_at || record.scheduled_date}
                                    language={language}
                                  />
                                </div>
                              )}
                            </div>
                            {calculatedStatus === "overdue" && (
                              <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                                <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">
                                  {language === "am" ? "⚠️ ይህልሱ!" : "⚠️ Action Needed!"}
                                </p>
                                <p className="text-xs text-orange-700 dark:text-orange-400">
                                  {language === "am" 
                                    ? "ይህልሱውን ለጡናውን ይህልሱውን እንዲያገኙ ወደ ቅርባት ጣቢያ ይሂዱ" 
                                    : "Please visit your nearest health center to get your child vaccinated"}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={`uppercase text-[10px] tracking-wider px-2 py-0 ${calculatedStatus === "completed" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 border-none" :
                              calculatedStatus === "overdue" ? "bg-orange-500 text-white hover:bg-orange-600 border-none" :
                                "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border-none"
                              }`}>
                              {calculatedStatus === "completed" ? (language === "am" ? "ተጠናቋል" : "Completed") :
                                calculatedStatus === "overdue" ? (language === "am" ? "ያስፈለግበት" : "Action Needed") :
                                  (language === "am" ? "በቅርቡ" : "Coming Up")}
                            </Badge>
                            {record.visit_number && (
                              <Badge variant="secondary" className="w-fit text-xs">
                                Visit {record.visit_number}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>

          {/* Appointments Section */}
          <Card className="p-6 shadow-sm border-border/50">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-foreground">
                {language === "am" ? "ቀጠሮዎች" : "Appointments"}
              </h3>
            </div>

            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">
                    {language === "am" ? "ቀጠሮ አልተያዘም" : "No scheduled appointments"}
                  </p>
                </div>
              ) : (
                appointments.map((apt) => {
                  const appointmentDate = new Date(apt.scheduled_at || apt.appointment_date || '')
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const appointmentDay = new Date(appointmentDate)
                  appointmentDay.setHours(0, 0, 0, 0)
                  
                  const isPast = appointmentDay < today
                  const isMissed = isPast && apt.status === 'scheduled'
                  const isCompleted = apt.status === 'completed'
                  
                  // Count vaccines in this appointment
                  const vaccineCount = apt.vaccination_records?.length || 0
                  
                  return (
                    <div 
                      key={apt.id} 
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isPast 
                          ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700' 
                          : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          isPast 
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' 
                            : 'bg-green-200 dark:bg-green-700 text-green-600 dark:text-green-300'
                        }`}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {apt.notes || (language === "am" ? "ጉዳል ቀጠሮ" : "Scheduled Visit")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointmentDate.toLocaleDateString()} 
                            {apt.scheduled_at && ` at ${appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {language === "am" ? `ቫለውን ${vaccineCount} ክትባቶች` : `${vaccineCount} vaccines scheduled`}
                          </p>
                          {apt.scheduled_at && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Ethiopian Date: <EthiopianDateConverter 
                                date={apt.scheduled_at}
                                language={language}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`w-fit ${
                            isMissed 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' 
                              : isCompleted 
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
                          }`}
                        >
                          {isMissed 
                            ? (language === "am" ? "ተወዋ" : "Missed")
                            : isCompleted 
                              ? (language === "am" ? "ተጠናቋል" : "Completed")
                              : (language === "am" ? "ተያዘ" : "Scheduled")
                          }
                        </Badge>
                        {apt.visit_number && (
                          <Badge variant="secondary" className="w-fit">
                            Visit {apt.visit_number}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <Card className="p-6 shadow-sm border-border/50 h-fit">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-foreground">
                {language === "am" ? "የልጅ ዝርዝር" : "Child Details"}
              </h3>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {language === "am" ? "ጾታ" : "Gender"}
                  </p>
                  <p className="font-medium capitalize text-foreground">
                    {child.sex === "male" ? (language === "am" ? "ወንድ" : "Male") : (language === "am" ? "ሴት" : "Female")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {language === "am" ? "ብሔራዊ መታወቂያ" : "National ID"}
                  </p>
                  <p className="font-mono font-medium text-foreground">
                    {child.national_id || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {language === "am" ? "አድራሻ" : "Address"}
                  </p>
                  <p className="font-medium text-foreground leading-relaxed">
                    {child.address || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <h4 className="text-sm font-bold text-primary mb-1">
                  {language === "am" ? "መርጃ" : "Need help?"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {language === "am"
                    ? "ስለ ክትባቶች ወይም ቀጠሮዎች ማንኛውም ጥያቄ ካለዎት እባክዎ የአቅራቢያዎ ጤና ጣቢያን ያነጋግሩ።"
                    : "If you have any questions about vaccinations or appointments, please contact your nearest health center."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .pulse-red {
          animation: pulse-red 2s infinite;
        }
      `}</style>
    </div>
  )
}
