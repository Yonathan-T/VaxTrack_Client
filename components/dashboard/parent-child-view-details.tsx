"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Phone, Mail, Edit, Save, X, CheckCircle2, AlertCircle, Heart, User, MapPin, Baby, TrendingUp } from 'lucide-react'
import { useLanguage } from "@/lib/language-context"
import { useChildren } from "@/lib/children-context"
import { useVaccinations } from "@/lib/vaccinations-context"
import { t } from "@/lib/translations"

interface ParentChildViewDetailsProps {
  childId: string
}

export function ParentChildViewDetails({ childId }: ParentChildViewDetailsProps) {
  const { language } = useLanguage()
  const { children } = useChildren()
  const { vaccinations } = useVaccinations()
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [savedSuccess, setSavedSuccess] = useState(false)

  const child = children.find((c) => c.id === childId)

  if (!child) {
    return (
      <Card className="p-8 text-center border-2">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">{t("children.noChildrenFound", language)}</p>
      </Card>
    )
  }

  // Initialize contact info
  if (!phone && !email && !isEditingContact) {
    setPhone(child.guardianPhone)
    setEmail(child.guardianEmail)
  }

  const childVaccinations = vaccinations.filter((v) => v.childId === childId && v.status === "completed")

  // Calculate vaccination status
  const completionRate = childVaccinations.length > 0 ? 80 : 20
  const upcomingVaccines = [
    { vaccine: "Penta 2", dueDate: "2024-06-15", status: "upcoming" },
    { vaccine: "OPV 2", dueDate: "2024-06-15", status: "upcoming" },
    { vaccine: "Pentavalent Booster", dueDate: "2024-07-20", status: "upcoming" },
  ]

  const handleSaveContact = () => {
    setSavedSuccess(true)
    setIsEditingContact(false)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleCancelEdit = () => {
    setPhone(child.guardianPhone)
    setEmail(child.guardianEmail)
    setIsEditingContact(false)
  }

  return (
    <div className="space-y-6">
      {/* Hero Profile Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20" />
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-4xl font-bold text-primary-foreground">
                {child.firstName.charAt(0)}
                {child.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {child.firstName} {child.lastName}
                </h1>
                <Heart className="h-6 w-6 text-secondary fill-secondary" />
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {language === "am" ? "ተወልደ:" : "Born:"} {child.dateOfBirth}
              </p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <Badge className="bg-secondary/20 text-secondary-foreground border-secondary/30">
                  {language === "am" ? "ክትባተ ሙሉ" : "Vaccinations Up to Date"}
                </Badge>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  {completionRate}% {language === "am" ? "ተጠናቋል" : "Complete"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vaccination Summary Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-4 border-l-4 border-l-green-500">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === "am" ? "ተጠናቋል" : "Completed"}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{childVaccinations.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === "am" ? "ውድቅ" : "Upcoming"}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{upcomingVaccines.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === "am" ? "መኖ" : "Progress"}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Vaccination History */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-bold text-foreground">
                {language === "am" ? "ክትባት ታሪክ" : "Vaccination History"}
              </h2>
            </div>

            {childVaccinations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {language === "am" ? "ምንም ክትባቶች ገና አልተመዘገቡም" : "No vaccinations recorded yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {childVaccinations.map((vaccination) => (
                  <div
                    key={vaccination.id}
                    className="border border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{vaccination.vaccine}</h3>
                          <p className="text-sm text-muted-foreground">
                            {language === "am" ? "ክትባተ ቀን:" : "Date:"} {vaccination.date}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200 flex-shrink-0">
                        {language === "am" ? "ተጠናቋል" : "Completed"}
                      </Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs bg-white/50 p-3 rounded">
                      <div>
                        <p className="text-muted-foreground text-xs">
                          {language === "am" ? "ሙከራ ቁጥር" : "Batch Number"}
                        </p>
                        <p className="font-medium text-foreground">{vaccination.batchNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">
                          {language === "am" ? "ተጠንቅቀ በ" : "Administered By"}
                        </p>
                        <p className="font-medium text-foreground">{vaccination.administeredBy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Schedules */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-foreground">
                {language === "am" ? "ቀጣይ የክትባት መርሃግብር" : "Upcoming Vaccinations"}
              </h2>
            </div>

            {upcomingVaccines.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  {language === "am" ? "ምንም ጤናተኛ ጊዜ ገና የለም" : "No upcoming schedules"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingVaccines.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-foreground">{schedule.vaccine}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === "am" ? "መቼ:" : "Due:"} {schedule.dueDate}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {language === "am" ? "ውድቅ" : "Upcoming"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Child Information Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Baby className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                {language === "am" ? "ልጅ መረጃ" : "Child Information"}
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {language === "am" ? "ጾታ" : "Gender"}
                </p>
                <p className="font-medium text-foreground capitalize">
                  {child.gender === "male" ? (language === "am" ? "ወንድ" : "Male") : language === "am" ? "ሴት" : "Female"}
                </p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === "am" ? "የትውልድ ክብደት" : "Birth Weight"}
                </p>
                <p className="font-medium text-foreground">{child.birthWeight} kg</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === "am" ? "የትውልድ ቦታ" : "Place of Birth"}
                </p>
                <p className="font-medium text-foreground">{child.placeOfBirth}</p>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-secondary" />
                <h3 className="font-semibold text-foreground">
                  {language === "am" ? "ግንኙነት" : "Contact"}
                </h3>
              </div>
              {!isEditingContact && (
                <Button size="sm" variant="outline" onClick={() => setIsEditingContact(true)}>
                  <Edit className="h-3 w-3 mr-1" />
                  <span className="text-xs">{language === "am" ? "ቀይር" : "Edit"}</span>
                </Button>
              )}
            </div>

            {isEditingContact ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    {language === "am" ? "ስልክ ቁጥር" : "Phone"}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    {language === "am" ? "ኢሜይል" : "Email"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 text-xs h-8" onClick={handleSaveContact}>
                    <Save className="h-3 w-3 mr-1" />
                    {language === "am" ? "ቆይ" : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3 w-3 mr-1" />
                    {language === "am" ? "ሰርዝ" : "Cancel"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">{language === "am" ? "ስልክ" : "Phone"}</p>
                    <p className="font-medium text-foreground">{phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">{language === "am" ? "ኢሜይል" : "Email"}</p>
                    <p className="font-medium text-foreground break-all">{email}</p>
                  </div>
                </div>
              </div>
            )}

            {savedSuccess && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded mt-3 border border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                {language === "am" ? "በተሳካ ሁኔታ ተቀምጧል" : "Saved successfully"}
              </div>
            )}
          </Card>

          {/* Location Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">
                {language === "am" ? "አገልግሎት" : "Location"}
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Kebele</p>
                <p className="font-medium text-foreground">{child.kebele}</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-1">Woreda</p>
                <p className="font-medium text-foreground">{child.woreda}</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === "am" ? "ቤት ቁጥር" : "House Number"}
                </p>
                <p className="font-medium text-foreground">{child.houseNumber}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
