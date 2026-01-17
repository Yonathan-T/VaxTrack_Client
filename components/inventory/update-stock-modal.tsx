"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

interface UpdateStockModalProps {
  isOpen: boolean
  onClose: () => void
  vaccine: {
    id: number
    name: string
    quantity: number
    minStock: number
    batchNumber: string
    expiryDate: string
  }
}

export function UpdateStockModal({ isOpen, onClose, vaccine }: UpdateStockModalProps) {
  const { toast } = useToast()
  const { language } = useLanguage()
  const [newQuantity, setNewQuantity] = useState(vaccine.quantity.toString())
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (!newQuantity || Number.parseInt(newQuantity) < 0) {
      toast({
        title: t("form.invalidQuantity", language),
        description: t("form.pleaseEnterValidQuantity", language),
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setTimeout(() => {
      toast({
        title: t("inventory.stockUpdated", language),
        description: `${vaccine.name} ${t("inventory.quantityUpdatedTo", language)} ${newQuantity} ${t("inventory.doses", language)}`,
      })
      setLoading(false)
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("inventory.updateStock", language)} - {vaccine.name}</DialogTitle>
          <DialogDescription>{t("inventory.updateQuantityForBatch", language)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("inventory.batchNumber", language)}</Label>
            <Input value={vaccine.batchNumber} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>{t("form.expiryDate", language)}</Label>
            <Input value={vaccine.expiryDate} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>{t("inventory.currentQuantity", language)}</Label>
            <Input value={vaccine.quantity} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newQuantity">{t("inventory.newQuantity", language)} ({t("inventory.doses", language)}) *</Label>
            <Input
              id="newQuantity"
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              placeholder={t("inventory.enterNewQuantity", language)}
            />
            <p className="text-xs text-muted-foreground">{t("inventory.minimumStockRequired", language)}: {vaccine.minStock} {t("inventory.doses", language)}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("form.cancel", language)}
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? `${t("form.updating", language)}...` : t("inventory.updateStock", language)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
