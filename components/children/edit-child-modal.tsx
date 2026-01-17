"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useState } from "react"

interface EditChildModalProps {
  isOpen: boolean
  onClose: () => void
  child: any
}

export function EditChildModal({ isOpen, onClose, child }: EditChildModalProps) {
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!child) {
    return null
  }

  const nameParts = child.name ? child.name.split(" ") : ["", ""]
  const guardianParts = child.guardian ? child.guardian.split(" ") : ["", ""]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("dashboard.actions.edit", language)} {t("form.childInformation", language)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("form.firstName", language)}</Label>
              <Input defaultValue={nameParts[0] || ""} />
            </div>
            <div>
              <Label>{t("form.lastName", language)}</Label>
              <Input defaultValue={nameParts[1] || ""} />
            </div>
            <div>
              <Label>{t("form.dateOfBirth", language)}</Label>
              <Input type="date" defaultValue={child.dateOfBirth || ""} />
            </div>
            <div>
              <Label>{t("children.gender", language)}</Label>
              <Select defaultValue={(child.gender || "").toLowerCase()}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("form.male", language)}</SelectItem>
                  <SelectItem value="female">{t("form.female", language)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">{t("form.guardianInformation", language)}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("form.guardianFirstName", language)}</Label>
                <Input defaultValue={guardianParts[0] || ""} />
              </div>
              <div>
                <Label>{t("form.guardianLastName", language)}</Label>
                <Input defaultValue={guardianParts[1] || ""} />
              </div>
              <div>
                <Label>{t("children.phone", language)}</Label>
                <Input defaultValue={child.phone || ""} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" defaultValue={child.email || ""} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("form.cancel", language)}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("form.registering", language) : t("form.submit", language)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
