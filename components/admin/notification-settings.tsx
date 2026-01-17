"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

export function NotificationSettings() {
  const { language } = useLanguage()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    reportNotifications: true,
  })

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {language === "am" ? "ማሳወቂያ ቅንብሮች" : "Notification Settings"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === "am" ? "ማሳወቂያ ተቆጣጠሩ" : "Manage system notifications"}
        </p>
      </div>

      <div className="space-y-3">
        {[
          {
            key: "emailNotifications",
            title: language === "am" ? "ኢ-ሜይል ማሳወቂያ" : "Email Notifications",
            desc: language === "am" ? "የኢ-ሜይል ማሳወቂያ ይቀበሉ" : "Receive email notifications",
          },
          {
            key: "smsNotifications",
            title: language === "am" ? "SMS ማሳወቂያ" : "SMS Notifications",
            desc: language === "am" ? "የ SMS ማሳወቂያ ይቀበሉ" : "Receive SMS notifications",
          },
          {
            key: "pushNotifications",
            title: language === "am" ? "ተላላፊ ማሳወቂያ" : "Push Notifications",
            desc: language === "am" ? "የተላላፊ ማሳወቂያ ይቀበሉ" : "Receive push notifications",
          },
          {
            key: "reportNotifications",
            title: language === "am" ? "የሪፖርት ማሳወቂያ" : "Report Notifications",
            desc: language === "am" ? "ሪፖርት ማሳወቂያ ይቀበሉ" : "Receive report notifications",
          },
        ].map((item) => (
          <Card key={item.key} className="p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <label className="flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings]}
                  onChange={() => toggleSetting(item.key)}
                  className="h-5 w-5 rounded border-primary cursor-pointer"
                />
              </label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
