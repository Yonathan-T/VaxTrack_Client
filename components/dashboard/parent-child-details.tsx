"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Phone, Mail, Edit, Save, X, CheckCircle2, AlertCircle, Trash2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useChildren } from "@/lib/children-context"
import { useVaccinations } from "@/lib/vaccinations-context"
import { t } from "@/lib/translations"
import { useRouter } from "next/navigation"

interface ParentChildDetailsProps {
  childId: string
}

export function ParentChildDetails({ childId }: ParentChildDetailsProps) {
  const { language } = useLanguage()
  const { children, updateChild, deleteChild } = useChildren()
  const { vaccinations } = useVaccinations()
  const router = useRouter()
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isEditingChild, setIsEditingChild] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const child = children.find((c) => c.id === childId)

  if (!child) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">{t("children.noChildrenFound", language)}</p>
      </Card>
    )
  }

  if (!phone && !email && !isEditingContact) {
    setPhone(child.guardianPhone)
    setEmail(child.guardianEmail)
  }

  const handleEditChild = () => {
    setFirstName(child.firstName)
    setMiddleName(child.middleName)
    setLastName(child.lastName)
    setDateOfBirth(child.dateOfBirth)
    setIsEditingChild(true)
  }

  const handleSaveChild = () => {
    updateChild(childId, {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
    })
    setSavedSuccess(true)
    setIsEditingChild(false)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleCancelEditChild = () => {
    setIsEditingChild(false)
  }

  const handleDeleteChild = () => {
    deleteChild(childId)
    router.push("/dashboard")
  }

  const childVaccinations = vaccinations.filter((v) => v.childId === childId && v.status === "completed")

  const upcomingSchedules = [
    {
      id: 1,
      vaccine: "Penta 2",
      dueDate: "2024-06-15",
      status: "upcoming",
    },
    {
      id: 2,
      vaccine: "OPV 2",
      dueDate: "2024-06-15",
      status: "upcoming",
    },
    {
      id: 3,
      vaccine: "Pentavalent Booster",
      dueDate: "2024-07-20",
      status: "upcoming",
    },
  ]

  const handleSaveContact = () => {
    updateChild(childId, {
      guardianPhone: phone,
      guardianEmail: email,
    })
    setSavedSuccess(true)
    setIsEditingContact(false)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleCancelEdit = () => {
    setPhone(child.guardianPhone)
    setEmail(child.guardianEmail)
    setIsEditingContact(false)
  }

  const handleScheduleAppointment = (vaccine: string) => {
    router.push(`/dashboard/appointments/schedule?vaccine=${vaccine}&childId=${childId}`)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {child.firstName.charAt(0)}
                {child.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {child.firstName} {child.middleName} {child.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === "am" ? "የልጅ መታወቂያ:" : "Vaccine ID:"} {child.vaccineId}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "am" ? "ተወልደ:" : "Date of Birth:"} {child.dateOfBirth}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditChild}
              className="text-blue-600 hover:text-blue-700 bg-transparent"
            >
              <Edit className="h-4 w-4 mr-2" />
              {language === "am" ? "ቀይር" : "Edit"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {language === "am" ? "ሰርዝ" : "Delete"}
            </Button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium mb-3">
              {language === "am"
                ? `${child.firstName}ን ሰርዝ ነው? ይህ ተግባር ሊመለስ አይችልም።`
                : `Delete ${child.firstName}? This action cannot be undone.`}
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteChild}>
                {language === "am" ? "ሰርዝ" : "Delete"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                {language === "am" ? "ይቅር" : "Cancel"}
              </Button>
            </div>
          </div>
        )}

        {isEditingChild ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <h3 className="font-semibold text-foreground mb-3">
              {language === "am" ? "የሕፃን መረጃ ቀይር" : "Edit Child Information"}
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  {language === "am" ? "ስም" : "First Name"}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  {language === "am" ? "መካከለኛ ስም" : "Middle Name"}
                </label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  {language === "am" ? "የአባት ስም" : "Last Name"}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  {language === "am" ? "ተወልደ" : "Date of Birth"}
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleSaveChild}>
                <Save className="h-4 w-4 mr-2" />
                {language === "am" ? "ቆይ" : "Save"}
              </Button>
              <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={handleCancelEditChild}>
                <X className="h-4 w-4 mr-2" />
                {language === "am" ? "ይቅር" : "Cancel"}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{language === "am" ? "ልጅ መረጃ" : "Child Information"}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">{language === "am" ? "ጾታ" : "Gender"}</span>
                <span className="font-medium capitalize">
                  {child.gender === "male" ? (language === "am" ? "ወንድ" : "Male") : language === "am" ? "ሴት" : "Female"}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">{language === "am" ? "የትውልድ ክብደት" : "Birth Weight"}</span>
                <span className="font-medium">{child.birthWeight} kg</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">{language === "am" ? "የትውልድ ቦታ" : "Place of Birth"}</span>
                <span className="font-medium">{child.placeOfBirth}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                {language === "am" ? "ግንኙነት መረጃ" : "Contact Information"}
              </h3>
              {!isEditingContact && (
                <Button size="sm" variant="outline" onClick={() => setIsEditingContact(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {language === "am" ? "ቀይር" : "Edit"}
                </Button>
              )}
            </div>

            {isEditingContact ? (
              <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    {language === "am" ? "ስልክ ቁጥር" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+251 9XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    {language === "am" ? "ኢሜይል" : "Email"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="example@email.com"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={handleSaveContact}>
                    <Save className="h-4 w-4 mr-2" />
                    {language === "am" ? "ቆይ" : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    {language === "am" ? "ሰርዝ" : "Cancel"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{language === "am" ? "ስልክ" : "Phone"}</p>
                    <p className="font-medium">{phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{language === "am" ? "ኢሜይል" : "Email"}</p>
                    <p className="font-medium">{email}</p>
                  </div>
                </div>
              </div>
            )}

            {savedSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                <CheckCircle2 className="h-4 w-4" />
                {language === "am" ? "በተሳካ ሁኔታ ተቀምጧል" : "Saved successfully"}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {language === "am" ? "ክትባት ታሪክ" : "Vaccination History"}
        </h3>

        {childVaccinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {language === "am" ? "ምንም ክትባቶች ገና አልተመዘገቡም" : "No vaccinations recorded yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {childVaccinations.map((vaccination) => (
              <div
                key={vaccination.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{vaccination.vaccine}</h4>
                    <p className="text-sm text-muted-foreground">
                      {language === "am" ? "ክትባተ ቀን:" : "Date:"} {vaccination.date}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {language === "am" ? "ተጠናቋል" : "Completed"}
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs ml-8">
                  <div>
                    <p className="text-muted-foreground">{language === "am" ? "ሙከራ ቁጥር" : "Batch Number"}</p>
                    <p className="font-medium text-foreground">{vaccination.batchNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{language === "am" ? "ተጠንቅቀ በ" : "Administered By"}</p>
                    <p className="font-medium text-foreground">{vaccination.administeredBy}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{language === "am" ? "ተቋም" : "Facility"}</p>
                    <p className="font-medium text-foreground">{vaccination.facility}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {language === "am" ? "ቀጣይ የክትባት መርሃግብር" : "Upcoming Vaccination Schedules"}
        </h3>

        <div className="space-y-3">
          {upcomingSchedules.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {language === "am" ? "ምንም ጤናተኛ ጊዜ ገና የለም" : "No upcoming schedules"}
              </p>
            </div>
          ) : (
            upcomingSchedules.map((schedule) => (
              <div
                key={schedule.id}
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
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {language === "am" ? "ቀጣይ 7 ቀናት" : "Next 7 days"}
        </h3>

        <div className="space-y-3">
          {upcomingSchedules.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {language === "am" ? "ምንም ጤናተኛ ጊዜ ገና የለም" : "No upcoming schedules"}
              </p>
            </div>
          ) : (
            upcomingSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{schedule.vaccine}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === "am" ? "ክትባት ሚገባ: " : "Vaccination due: "} {child.firstName}{" "}
                      {language === "am" ? "ያስፈልጋል" : "needs"} {schedule.vaccine}{" "}
                      {language === "am" ? "ክትባት" : "vaccine"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "am" ? "መቼ:" : "Date:"} {schedule.dueDate}
                    </p>
                  </div>
                </div>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white flex-shrink-0"
                  onClick={() => handleScheduleAppointment(schedule.vaccine)}
                >
                  {language === "am" ? "ታቅድ" : "Schedule"}
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
