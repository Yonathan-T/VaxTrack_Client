"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"

export function ParentNotificationSettings() {
  const { language } = useLanguage()
  const [settings, setSettings] = useState({
    smsReminders: true,
    emailReminders: true,
    reminder24hBefore: true,
    reminderOnDay: true,
    missedVaccineAlerts: true,
    upcomingScheduleAlerts: true,
  })

  const handleSave = () => {
    // Save settings logic
    console.log("Settings saved:", settings)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {language === "am" ? "የማሳወቂያ ምርጫዎች" : "Notification Preferences"}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-reminders" className="text-sm">
                {language === "am" ? "SMS ማስታወቂያዎች" : "SMS Reminders"}
              </Label>
              <Switch
                id="sms-reminders"
                checked={settings.smsReminders}
                onCheckedChange={(checked) => setSettings({ ...settings, smsReminders: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email-reminders" className="text-sm">
                {language === "am" ? "ኢሜይል ማስታወቂያዎች" : "Email Reminders"}
              </Label>
              <Switch
                id="email-reminders"
                checked={settings.emailReminders}
                onCheckedChange={(checked) => setSettings({ ...settings, emailReminders: checked })}
              />
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                {language === "am" ? "ማስታወቂያ ጊዜ" : "Reminder Timing"}
              </h4>

              <div className="flex items-center justify-between">
                <Label htmlFor="reminder-24h" className="text-sm">
                  {language === "am" ? "24 ሰዓታት በፊት" : "24 hours before"}
                </Label>
                <Switch
                  id="reminder-24h"
                  checked={settings.reminder24hBefore}
                  onCheckedChange={(checked) => setSettings({ ...settings, reminder24hBefore: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reminder-day" className="text-sm">
                  {language === "am" ? "ዝግጅት ቀኑ ላይ" : "On appointment day"}
                </Label>
                <Switch
                  id="reminder-day"
                  checked={settings.reminderOnDay}
                  onCheckedChange={(checked) => setSettings({ ...settings, reminderOnDay: checked })}
                />
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">{language === "am" ? "ጠንቅቆች" : "Alerts"}</h4>

                <div className="flex items-center justify-between">
                  <Label htmlFor="missed-vaccine" className="text-sm">
                    {language === "am" ? "የጠፉ ክትባቶች ማንቂያዎች" : "Missed vaccine alerts"}
                  </Label>
                  <Switch
                    id="missed-vaccine"
                    checked={settings.missedVaccineAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, missedVaccineAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="upcoming-schedule" className="text-sm">
                    {language === "am" ? "ወደ ፊትመልሰ ደrhodes ማንቂያዎች" : "Upcoming schedule alerts"}
                  </Label>
                  <Switch
                    id="upcoming-schedule"
                    checked={settings.upcomingScheduleAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, upcomingScheduleAlerts: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={handleSave}>
          {language === "am" ? "ምርጫ ቆይ" : "Save Preferences"}
        </Button>
      </div>
    </Card>
  )
}
