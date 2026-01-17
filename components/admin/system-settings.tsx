"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export function SystemSettings() {
  const { language } = useLanguage()
  const [settings, setSettings] = useState({
    organizationName: "Ministry of Health",
    timezone: "Africa/Addis_Ababa",
    dateFormat: "DD/MM/YYYY",
    language: "English",
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{language === "am" ? "ስርዓት ቅንብሮች" : "System Settings"}</h2>
        <p className="text-sm text-muted-foreground">
          {language === "am" ? "ስርዓት ፓራሜትር ያዋቅሩ" : "Configure system parameters"}
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {[
            {
              label: language === "am" ? "ድርጅት ስም" : "Organization Name",
              key: "organizationName",
              type: "text",
            },
            {
              label: language === "am" ? "የሰዓት ክልል" : "Timezone",
              key: "timezone",
              type: "select",
              options: ["Africa/Addis_Ababa", "UTC", "Africa/Nairobi"],
            },
            {
              label: language === "am" ? "ቀን ቅርጽ" : "Date Format",
              key: "dateFormat",
              type: "select",
              options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
            },
            {
              label: language === "am" ? "ቋንቋ" : "Language",
              key: "language",
              type: "select",
              options: ["English", "Amharic"],
            },
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-foreground">{field.label}</label>
              {field.type === "text" ? (
                <input
                  type="text"
                  value={settings[field.key as keyof typeof settings]}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg bg-background text-foreground text-sm"
                />
              ) : (
                <select
                  value={settings[field.key as keyof typeof settings]}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg bg-background text-foreground text-sm"
                >
                  {(field as any).options?.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1 sm:flex-none">
              {language === "am" ? "ያድሱ" : "Save"}
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none bg-transparent">
              {language === "am" ? "ቅናሽ" : "Reset"}
            </Button>
          </div>

          {saved && (
            <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {language === "am" ? "ቅንብሮች ተቀምጠዋል" : "Settings saved successfully"}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
