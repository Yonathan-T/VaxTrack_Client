"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Copy, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { DefaulterData } from "@/lib/admin-api"

interface DefaulterReportProps {
  data: DefaulterData[]
}

export function DefaulterReport({ data }: DefaulterReportProps) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [showAllDefaulters, setShowAllDefaulters] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [currentEmail, setCurrentEmail] = useState({ to: '', subject: '', body: '' })

  // Handle potential nested data structure from API
  // The API might return { defaulters: [...] } or just [...]
  let defaulters: DefaulterData[] = []
  if (Array.isArray(data)) {
    defaulters = data
  } else if (data && typeof data === 'object' && Array.isArray((data as any).defaulters)) {
    defaulters = (data as any).defaulters
  }

  // Sort by most overdue (most_overdue_days is negative, so we sort ascending for "worst first")
  const sortedDefaulters = [...defaulters].sort((a, b) => (a.most_overdue_days || 0) - (b.most_overdue_days || 0))

  const handleSendEmail = (defaulter: DefaulterData) => {
    if (!defaulter.parent_email) {
      toast({
        title: language === "am" ? "ኢሜይል ይጎዳነል" : "Missing Email",
        description: language === "am" 
          ? `ለ ${defaulter.parent || "ወላጅ"} ኢሜይል አድራሻ አልተገኘም`
          : `No email address found for ${defaulter.parent || "parent"}`,
        variant: "destructive"
      })
      return
    }
    
    const vaccines = defaulter.overdue_vaccines || []
    const vaccineList = vaccines.map(v => v.vaccine).join(", ")

    const subject = language === "am" 
      ? `ለ ${defaulter.name} የክትባት ክትትል ማሳሰቢያ`
      : `Vaccination Follow-up Reminder for ${defaulter.name}`

    const body = language === "am"
      ? `ውድ አቶ/ወይዘሮ ${defaulter.parent}፣

ይህ ማሳሰቢያ ልጅዎ ${defaulter.name} የሚከተሉትን ክትባቶች ስላልወሰደ/ች ለማሳሰብ ነው፦

ያመለጡ ክትባቶች፦ ${vaccineList}

እባክዎ በተቻለ ፍጥነት በአቅራቢዎ ወደሚገኝ የጤና ማዕከል በመሄድ አስፈላጊ የሆኑ ክትባቶችን እንዲያስከትቡ እናሳስባለን።

ከሰላምታ ጋር፣
የቫክስትራክ ቡድን`

      : `Dear ${defaulter.parent},

This is a reminder that your child ${defaulter.name} has missed the following vaccinations:

${vaccineList}

Please visit the nearest vaccination center as soon as possible to complete the missed vaccinations.

Thank you,
VaxTrack System`

    // Set email data and open modal
    setCurrentEmail({
      to: defaulter.parent_email,
      subject,
      body
    })
    setEmailModalOpen(true)
  }

  const copyToClipboard = () => {
    const emailText = `To: ${currentEmail.to}\nSubject: ${currentEmail.subject}\n\n${currentEmail.body}`
    navigator.clipboard.writeText(emailText).then(() => {
      toast({
        title: language === "am" ? "ተቀዳቅሏል" : "Copied",
        description: language === "am" ? "ኢሜይል ተቀዳቅሏል" : "Email copied to clipboard",
      })
    })
  }

  const handleViewAllDefaulters = () => {
    setShowAllDefaulters(!showAllDefaulters)
    if (!showAllDefaulters && defaulters.length > 3) {
      toast({
        title: t("reports.defaultersList", language),
        description: `${t("reports.showingAll", language)} ${defaulters.length} ${t("reports.defaulters", language)}`,
      })
    }
  }

  const displayedDefaulters = showAllDefaulters ? sortedDefaulters : sortedDefaulters.slice(0, 3)

  // Total overdue count across all children
  const totalOverdueCount = defaulters.reduce((acc: number, d: DefaulterData) => acc + (d.total_overdue || 0), 0)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t("reports.defaulterTracking", language)}</h3>
          <p className="text-sm text-muted-foreground">{t("reports.childrenWithMissedVaccinations", language)}</p>
        </div>
        <Badge variant={defaulters.length > 0 ? "destructive" : "secondary"} className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {totalOverdueCount} {t("reports.overdue", language)}
        </Badge>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {defaulters.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground italic">No defaulters identified.</p>
        ) : (
          displayedDefaulters.map((defaulter, index) => {
            const vaccines = defaulter.overdue_vaccines || []
            const daysOverdue = Math.abs(defaulter.most_overdue_days || 0)
            const kebele = defaulter.address?.kebele || "N/A"
            const woreda = defaulter.address?.woreda || "N/A"

            return (
              <div key={defaulter.child_id || `defaulter-${index}`} className="border border-border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{defaulter.name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      {defaulter.total_overdue || vaccines.length} {language === "am" ? "ክትባቶች ያለፋቸው" : "vaccines overdue"}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {daysOverdue} {t("reports.days", language)}
                  </Badge>
                </div>

                {/* List of overdue vaccines */}
                {vaccines.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {vaccines.slice(0, 4).map((vax) => (
                      <Badge key={vax.id} variant="outline" className="text-xs border-red-200 text-red-700">
                        {vax.vaccine}
                      </Badge>
                    ))}
                    {vaccines.length > 4 && (
                      <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                        +{vaccines.length - 4} {language === "am" ? "ተጨማሪ" : "more"}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <span className="text-muted-foreground">{t("reports.kebele", language)}:</span>
                    <span className="ml-1 text-foreground">{kebele}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("reports.woreda", language)}:</span>
                    <span className="ml-1 text-foreground">{woreda}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("form.guardianName", language)}:</span>
                    <span className="ml-1 text-foreground">{defaulter.parent || "N/A"}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-muted-foreground">{language === "am" ? "ስልክ" : "Phone"}:</span>
                    <span className="ml-1 text-foreground font-mono">{defaulter.parent_phone || "N/A"}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full bg-transparent hover:bg-primary/10 hover:text-primary border-primary/20"
                  onClick={() => handleSendEmail(defaulter)}
                >
                  {t("reports.sendFollowUpEmail", language)}
                </Button>
              </div>
            )
          })
        )}
      </div>

      {defaulters.length > 3 && (
        <div className="mt-4 pt-4 border-t border-border text-center">
          <Button variant="outline" className="w-full bg-transparent" onClick={handleViewAllDefaulters}>
            {showAllDefaulters ? t("reports.showLess", language) : t("reports.viewAllDefaulters", language)}
          </Button>
        </div>
      )}

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {language === "am" ? "የክትባት ማሳሰቢያ ኢሜይል" : "Vaccination Follow-up Email"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {language === "am" ? "ወደ" : "To"}:
              </label>
              <div className="mt-1 p-2 bg-muted rounded text-sm">
                {currentEmail.to}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {language === "am" ? "ርዕስ" : "Subject"}:
              </label>
              <div className="mt-1 p-2 bg-muted rounded text-sm">
                {currentEmail.subject}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {language === "am" ? "መልእክት" : "Message"}:
              </label>
              <Textarea
                value={currentEmail.body}
                readOnly
                className="mt-1 min-h-[200px]"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={copyToClipboard} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                {language === "am" ? "ቅዳ" : "Copy Email"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEmailModalOpen(false)}
              >
                {language === "am" ? "ዝጋ" : "Close"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
