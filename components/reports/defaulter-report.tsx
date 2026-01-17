"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useState } from "react"

export function DefaulterReport() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [showAllDefaulters, setShowAllDefaulters] = useState(false)

  const defaulters = [
    {
      id: 1,
      child: language === "am" ? "ዳዊት ተስፋዬ" : "Dawit Tesfaye",
      vaccine: t("vaccine.opv3", language),
      dueDate: "2024-08-10",
      daysOverdue: 97,
      guardian: language === "am" ? "ሃና ተስፋዬ" : "Hanna Tesfaye",
      phone: "+251933456789",
      kebele: t("location.kebele03", language),
    },
    {
      id: 2,
      child: language === "am" ? "ሜሮን ግርማ" : "Meron Girma",
      vaccine: t("vaccine.penta3", language),
      dueDate: "2024-09-15",
      daysOverdue: 61,
      guardian: language === "am" ? "ሰላማዊት ግርማ" : "Selamawit Girma",
      phone: "+251944567890",
      kebele: t("location.kebele05", language),
    },
    {
      id: 3,
      child: language === "am" ? "ዮሐንስ በቀለ" : "Yohannes Bekele",
      vaccine: t("vaccine.measles1", language),
      dueDate: "2024-10-01",
      daysOverdue: 45,
      guardian: language === "am" ? "አልማዝ በቀለ" : "Almaz Bekele",
      phone: "+251955678901",
      kebele: t("location.kebele07", language),
    },
    {
      id: 4,
      child: language === "am" ? "ሳራ ኃይሌ" : "Sara Haile",
      vaccine: t("vaccine.pcv2", language),
      dueDate: "2024-10-20",
      daysOverdue: 26,
      guardian: language === "am" ? "ራሄል ኃይሌ" : "Rahel Haile",
      phone: "+251966789012",
      kebele: t("location.kebele02", language),
    },
  ]

  const handleSendSMS = (defaulter) => {
    toast({
      title: t("reports.followUpSmsSent", language),
      description: `${t("reports.smsSentTo", language)} ${defaulter.guardian} (${defaulter.phone}) ${t("reports.for", language)} ${defaulter.child}'s ${defaulter.vaccine} ${t("vaccinations.vaccine", language)}`,
    })
  }

  const handleViewAllDefaulters = () => {
    setShowAllDefaulters(!showAllDefaulters)
    toast({
      title: t("reports.defaultersList", language),
      description: showAllDefaulters
        ? t("reports.showingLimitedView", language)
        : `${t("reports.showingAll", language)} ${defaulters.length} ${t("reports.defaulters", language)}`,
    })
  }

  const displayedDefaulters = showAllDefaulters ? defaulters : defaulters.slice(0, 3)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t("reports.defaulterTracking", language)}</h3>
          <p className="text-sm text-muted-foreground">{t("reports.childrenWithMissedVaccinations", language)}</p>
        </div>
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {defaulters.length} {t("reports.overdue", language)}
        </Badge>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {displayedDefaulters.map((defaulter) => (
          <div key={defaulter.id} className="border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">{defaulter.child}</p>
                <p className="text-sm text-muted-foreground">{defaulter.vaccine}</p>
              </div>
              <Badge variant="destructive" className="text-xs">
                {defaulter.daysOverdue} {t("reports.days", language)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">{t("reports.dueDate", language)}:</span>
                <span className="ml-1 text-foreground">{defaulter.dueDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("reports.kebele", language)}:</span>
                <span className="ml-1 text-foreground">{defaulter.kebele}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("children.guardian", language)}:</span>
                <span className="ml-1 text-foreground">{defaulter.guardian}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("children.phone", language)}:</span>
                <span className="ml-1 text-foreground">{defaulter.phone}</span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => handleSendSMS(defaulter)}
            >
              {t("reports.sendFollowUpSms", language)}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border text-center">
        <Button variant="outline" className="w-full bg-transparent" onClick={handleViewAllDefaulters}>
          {showAllDefaulters ? t("reports.showLess", language) : t("reports.viewAllDefaulters", language)}
        </Button>
      </div>
    </Card>
  )
}
