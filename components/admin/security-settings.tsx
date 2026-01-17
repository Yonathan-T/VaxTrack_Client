"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export function SecuritySettings() {
  const { language } = useLanguage()
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "30",
    passwordMinLength: "8",
    passwordRequireNumber: true,
  })

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]:
        typeof prev[key as keyof typeof prev] === "boolean"
          ? !prev[key as keyof typeof prev]
          : prev[key as keyof typeof prev],
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {language === "am" ? "ደህንነት ቅንብሮች" : "Security Settings"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === "am" ? "ስርዓት ደህንነት ያስተዳድሩ" : "Manage system security"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-base">
              {language === "am" ? "የ2-Factor ማረጋገጫ" : "2-Factor Authentication"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{language === "am" ? "ነቅዳት ማረጋገጫ" : "Enable 2FA"}</p>
          </div>
          <Button
            variant={settings.twoFactorEnabled ? "default" : "outline"}
            onClick={() => handleToggle("twoFactorEnabled")}
            className="w-full"
          >
            {settings.twoFactorEnabled
              ? language === "am"
                ? "ነቅዳት ከፈተ"
                : "Enabled"
              : language === "am"
                ? "ነቅዳት"
                : "Enable"}
          </Button>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-base">{language === "am" ? "ስስሪ ጊዜ" : "Session Timeout"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {settings.sessionTimeout} {language === "am" ? "ደቂቃ" : "minutes"}
            </p>
          </div>
          <select
            value={settings.sessionTimeout}
            onChange={(e) => setSettings((prev) => ({ ...prev, sessionTimeout: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm"
          >
            <option value="15">15 {language === "am" ? "ደቂቃ" : "minutes"}</option>
            <option value="30">30 {language === "am" ? "ደቂቃ" : "minutes"}</option>
            <option value="60">60 {language === "am" ? "ደቂቃ" : "minutes"}</option>
          </select>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-base">{language === "am" ? "የይለፅፍ መቅናት" : "Password Min Length"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {settings.passwordMinLength} {language === "am" ? "ገበታ" : "characters"}
            </p>
          </div>
          <select
            value={settings.passwordMinLength}
            onChange={(e) => setSettings((prev) => ({ ...prev, passwordMinLength: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm"
          >
            <option value="6">6 {language === "am" ? "ገበታ" : "characters"}</option>
            <option value="8">8 {language === "am" ? "ገበታ" : "characters"}</option>
            <option value="12">12 {language === "am" ? "ገበታ" : "characters"}</option>
          </select>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-base">{language === "am" ? "ቁጥር ይጠይቅ" : "Require Numbers"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "am" ? "ይለፅፍ ውስጥ ቁጥር ያስፈልግ" : "Numbers in passwords"}
            </p>
          </div>
          <Button
            variant={settings.passwordRequireNumber ? "default" : "outline"}
            onClick={() => handleToggle("passwordRequireNumber")}
            className="w-full"
          >
            {settings.passwordRequireNumber
              ? language === "am"
                ? "ያስፈልጋል"
                : "Required"
              : language === "am"
                ? "አያስፈልግም"
                : "Not Required"}
          </Button>
        </Card>
      </div>
    </div>
  )
}
