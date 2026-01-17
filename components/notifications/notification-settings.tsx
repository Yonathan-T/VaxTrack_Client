"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    smsEnabled: true,
    emailEnabled: false,
    reminderBefore24h: true,
    reminderOnDay: true,
    missedAppointment: true,
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-enabled" className="text-sm">
              Enable SMS Notifications
            </Label>
            <Switch
              id="sms-enabled"
              checked={settings.smsEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, smsEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="email-enabled" className="text-sm">
              Enable Email Notifications
            </Label>
            <Switch
              id="email-enabled"
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, emailEnabled: checked })}
            />
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Reminder Schedule</h4>

            <div className="flex items-center justify-between">
              <Label htmlFor="reminder-24h" className="text-sm">
                24 hours before
              </Label>
              <Switch
                id="reminder-24h"
                checked={settings.reminderBefore24h}
                onCheckedChange={(checked) => setSettings({ ...settings, reminderBefore24h: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reminder-day" className="text-sm">
                On appointment day
              </Label>
              <Switch
                id="reminder-day"
                checked={settings.reminderOnDay}
                onCheckedChange={(checked) => setSettings({ ...settings, reminderOnDay: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="missed-appointment" className="text-sm">
                Missed appointment alerts
              </Label>
              <Switch
                id="missed-appointment"
                checked={settings.missedAppointment}
                onCheckedChange={(checked) => setSettings({ ...settings, missedAppointment: checked })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-3">SMS Template</h4>
        <Textarea
          placeholder="Customize your SMS template..."
          defaultValue="Reminder: {child_name} has a vaccination appointment for {vaccine} on {date} at {time}. Location: {facility}. Reply CONFIRM to confirm."
          rows={4}
          className="text-sm"
        />
      </div>

      <Button className="w-full">Save Settings</Button>
    </div>
  )
}
