"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useState } from "react"
import type { DefaulterData } from "@/lib/admin-api"

interface DefaulterReportProps {
  data: DefaulterData[]
}

export function DefaulterReport({ data }: DefaulterReportProps) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [showAllDefaulters, setShowAllDefaulters] = useState(false)

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
        title: "Missing Email",
        description: `No email address found for ${defaulter.parent || "parent"}`,
        variant: "destructive"
      })
      return
    }
    const vaccines = defaulter.overdue_vaccines || []
    const firstVaccine = vaccines[0]?.vaccine || "vaccination"
    toast({
      title: t("reports.followUpEmailSent", language) || "Follow-up Email Sent",
      description: `${t("reports.emailSentTo", language) || "Email sent to"} ${defaulter.parent} (${defaulter.parent_email}) ${t("reports.for", language)} ${defaulter.name}'s ${firstVaccine}`,
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
  const totalOverdueCount = defaulters.reduce((acc, d) => acc + (d.total_overdue || 0), 0)

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
    </Card>
  )
}
