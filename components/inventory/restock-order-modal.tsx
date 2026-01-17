"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

interface RestockOrderModalProps {
  isOpen: boolean
  onClose: () => void
  alert: {
    id: number
    type: string
    vaccine: string
    message: string
    priority: string
  }
}

export function RestockOrderModal({ isOpen, onClose, alert }: RestockOrderModalProps) {
  const { toast } = useToast()
  const { language } = useLanguage()
  const [quantity, setQuantity] = useState("")
  const [supplier, setSupplier] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!quantity || !supplier) {
      toast({
        title: t("form.missingInformation", language),
        description: t("form.pleaseFieldsRequired", language),
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setTimeout(() => {
      toast({
        title: t("inventory.restockOrderCreated", language),
        description: `${t("inventory.orderFor", language)} ${quantity} ${t("inventory.dosesOf", language)} ${alert.vaccine} ${t("inventory.from", language)} ${supplier} ${t("inventory.hasBeenSubmitted", language)}`,
      })
      setLoading(false)
      setQuantity("")
      setSupplier("")
      setNotes("")
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("inventory.createRestockOrder", language)}</DialogTitle>
          <DialogDescription>{t("inventory.createRestockOrderFor", language)} {alert.vaccine}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("inventory.vaccine", language)}</Label>
            <Input value={alert.vaccine} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>{t("inventory.alertType", language)}</Label>
            <Input value={alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">{t("inventory.orderQuantity", language)} ({t("inventory.doses", language)}) *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={t("inventory.enterQuantityToOrder", language)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">{t("inventory.supplier", language)} *</Label>
            <Input
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder={t("inventory.supplierName", language)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("form.notes", language)}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("inventory.additionalNotes", language)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("form.cancel", language)}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? `${t("form.creating", language)}...` : t("inventory.createOrder", language)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
