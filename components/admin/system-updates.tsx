"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { Download, CheckCircle, AlertCircle, Clock } from "lucide-react"

export function SystemUpdates() {
  const { language } = useLanguage()
  const [isUpdating, setIsUpdating] = useState(false)

  const updates = [
    {
      id: 1,
      version: "v2.1.0",
      releaseDate: "2025-01-10",
      status: "available",
      size: "245 MB",
      changes: [
        language === "am" ? "ስርዓት አሰራር ተሻሽሏል" : "Improved system performance",
        language === "am" ? "አደጋ ቅናሽ የተሻሻለ" : "Updated security patches",
        language === "am" ? "UX ማሻሻሎች" : "UX improvements",
      ],
    },
    {
      id: 2,
      version: "v2.0.5",
      releaseDate: "2025-01-05",
      status: "installed",
      size: "180 MB",
      changes: [
        language === "am" ? "ባግ ስርአት ተሰርዋል" : "Bug fixes",
        language === "am" ? "ከሚስጢር ቤተ ለመውጣት" : "Performance optimization",
      ],
    },
  ]

  const handleUpdate = () => {
    setIsUpdating(true)
    setTimeout(() => setIsUpdating(false), 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "installed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "available":
        return <Download className="h-5 w-5 text-blue-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-red-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{language === "am" ? "ስርዓት ማሻሻሎች" : "System Updates"}</h2>
        <p className="text-sm text-muted-foreground">
          {language === "am" ? "ስርዓት ማሻሻሎች ያስተዳድሩ" : "Manage system updates and maintenance"}
        </p>
      </div>

      <div className="space-y-3">
        {updates.map((update) => (
          <Card key={update.id} className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(update.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground text-sm sm:text-base">{update.version}</h4>
                      <span className="text-xs text-muted-foreground">{update.releaseDate}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{update.size}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    update.status === "installed"
                      ? "bg-green-100 text-green-700"
                      : update.status === "available"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {update.status === "installed"
                    ? language === "am"
                      ? "ተቀምጦ"
                      : "Installed"
                    : update.status === "available"
                      ? language === "am"
                        ? "ዓቅፍ"
                        : "Available"
                      : language === "am"
                        ? "በሂደት ውስጥ"
                        : "Pending"}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">{language === "am" ? "ለውጦች" : "Changes"}</p>
                <ul className="space-y-1">
                  {update.changes.map((change, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {update.status === "available" && (
                <Button onClick={handleUpdate} disabled={isUpdating} className="w-full sm:w-auto">
                  <Download className={`h-4 w-4 mr-2 ${isUpdating ? "animate-bounce" : ""}`} />
                  {isUpdating
                    ? language === "am"
                      ? "ማሳሪያ በሂደት ውስጥ..."
                      : "Updating..."
                    : language === "am"
                      ? "ማሳሪያ ጠበቅ"
                      : "Update Now"}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 sm:p-6 bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">
              {language === "am" ? "ማሳሪያ የተከናወነ ቀደም ተከታታይ ክወናዎች ያጋጥመውሙ ሊሆን ይችላል" : "Updates may require system restart"}
            </p>
            <p className="text-sm text-amber-800 mt-1">
              {language === "am" ? "ተጠቃሚዎች ወደ ስርዓቱ መውጣት እንዲችሉ አስታውቁ" : "Notify users before starting updates"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
