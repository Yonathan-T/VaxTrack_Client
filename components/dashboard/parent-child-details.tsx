"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, AlertCircle, Info, MapPin, ClipboardList, Loader2, User } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { getChildDetails, type Child } from "@/lib/parent-api"

interface ParentChildDetailsProps {
  childId: string
}

export function ParentChildDetails({ childId }: ParentChildDetailsProps) {
  const { language } = useLanguage()
  const [child, setChild] = useState<Child | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getChildDetails(childId)
        if (error) {
          setError(error.message)
        } else if (data) {
          setChild(data)
        }
      } catch (err) {
        setError("Failed to fetch child details")
      } finally {
        setIsLoading(false)
      }
    }
    fetchDetails()
  }, [childId])

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

              {(!child.vaccination_records || child.vaccination_records.length === 0) ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground italic">
                    {language === "am" ? "ምንም የክትባት መረጃ የለም" : "No vaccination records found"}
                  </p>
                </div>
              ) : (
                child.vaccination_records.map((record, index) => (
                  <div key={record.id} className="relative pl-0 md:pl-10">
                    {/* Circle on timeline */}
                    <div className={`absolute left-2.5 md:left-2 -translate-x-1/2 top-2 h-4 w-4 rounded-full border-4 border-background shadow-sm hidden md:block z-10 ${record.status === "completed" ? "bg-green-500" :
                      record.status === "overdue" ? "bg-red-500" : "bg-blue-400"
                      }`} />

                    <div className={`p-4 rounded-xl border transition-all ${record.status === "completed" ? "bg-green-50/30 border-green-100" :
                      record.status === "overdue" ? "bg-red-50/30 border-red-100 shadow-sm ring-1 ring-red-200" :
                        "bg-muted/30 border-border"
                      }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-foreground text-lg">{record.vaccine.name}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {record.vaccine.description}
                          </p>
                          <div className="flex flex-wrap gap-4 mt-3">
                            {record.date_administered ? (
                              <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {language === "am" ? "የተሰጠበት ቀን:" : "Administered:"} {new Date(record.date_administered).toLocaleDateString()}
                              </div>
                            ) : (
                              <div className={`text-xs px-2 py-0.5 rounded font-medium ${record.status === "overdue" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                }`}>
                                {record.status === "overdue"
                                  ? (language === "am" ? "ካለፈበት ቀን:" : "Overdue since:")
                                  : (language === "am" ? "ቀጠሮ:" : "Scheduled:")} {new Date(record.scheduled_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={`uppercase text-[10px] tracking-wider px-2 py-0 ${record.status === "completed" ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" :
                          record.status === "overdue" ? "bg-red-500 text-white hover:bg-red-500 border-none pulse-red" :
                            "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"
                          }`}>
                          {record.status === "completed" ? (language === "am" ? "ተጠናቋል" : "Completed") :
                            record.status === "overdue" ? (language === "am" ? "ወሳኝ!" : "Critical!") :
                              (language === "am" ? "በቅርቡ" : "Coming Up")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
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
              {(!child.appointments || child.appointments.length === 0) ? (
                <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">
                    {language === "am" ? "ቀጠሮ አልተያዘም" : "No scheduled appointments"}
                  </p>
                </div>
              ) : (
                child.appointments.map((apt) => (
                  <div key={apt.id} className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {new Date(apt.appointment_date).toLocaleDateString()} at {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-muted-foreground italic">
                          {apt.notes || (language === "am" ? "ምንም ማስታወሻ የለም" : "No notes from health worker")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {apt.status}
                    </Badge>
                  </div>
                ))
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
