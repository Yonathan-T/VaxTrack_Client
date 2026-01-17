"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Edit, Save, X, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"

export function ParentAccountSettings() {
  const { language } = useLanguage()
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  const handleSave = () => {
    setSavedSuccess(true)
    setIsEditing(false)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    })
    setIsEditing(false)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          {language === "am" ? "ግንኙነት መረጃ" : "Contact Information"}
        </h3>
        {!isEditing && (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            {language === "am" ? "ቀይር" : "Edit"}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              {language === "am" ? "ስም" : "Full Name"}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              {language === "am" ? "ኢሜይል" : "Email"}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              {language === "am" ? "ስልክ ቁጥር" : "Phone Number"}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {language === "am" ? "ቆይ" : "Save"}
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              {language === "am" ? "ሰርዝ" : "Cancel"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{language === "am" ? "ኢሜይል" : "Email"}</p>
              <p className="font-medium text-foreground">{formData.email || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{language === "am" ? "ስልክ" : "Phone"}</p>
              <p className="font-medium text-foreground">{formData.phone || "Not set"}</p>
            </div>
          </div>
        </div>
      )}

      {savedSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded mt-4">
          <CheckCircle2 className="h-4 w-4" />
          {language === "am" ? "በተሳካ ሁኔታ ተቀምጧል" : "Saved successfully"}
        </div>
      )}
    </Card>
  )
}
