"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useInventory, type VaccineStock } from "@/lib/inventory-context"

interface WastageModalProps {
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onClose?: () => void
    vaccine: VaccineStock
    children?: React.ReactNode
}

export function WastageModal({ isOpen: controlledOpen, onOpenChange: setControlledOpen, onClose, vaccine, children }: WastageModalProps) {
    const { toast } = useToast()
    const { language } = useLanguage()
    const { recordWastage } = useInventory()
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen
    const setIsOpen = isControlled ? setControlledOpen : setUncontrolledOpen

    const [quantity, setQuantity] = useState("")
    const [reason, setReason] = useState("expired")
    const [notes, setNotes] = useState("")
    const [loading, setLoading] = useState(false)

    const handleClose = () => {
        setIsOpen?.(false)
        onClose?.()
        setQuantity("")
        setReason("expired")
        setNotes("")
    }

    const handleSubmit = async () => {
        console.log('[WastageModal] Row handleSubmit triggered', { id: vaccine.id, quantity, reason })
        const qty = Number.parseInt(quantity)
        if (!quantity || isNaN(qty) || qty <= 0) {
            toast({
                title: "Invalid quantity",
                description: "Please enter a valid positive number",
                variant: "destructive",
            })
            return
        }

        if (qty > vaccine.quantity) {
            toast({
                title: "Insufficient stock",
                description: "Wastage quantity cannot exceed current stock",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            const result = await recordWastage(vaccine.id, {
                quantity: qty,
                reason,
                notes,
            })

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Wastage recorded successfully",
                })
                handleClose()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to record wastage",
                    variant: "destructive",
                })
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Network error",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(val) => {
            if (!val) handleClose()
            else setIsOpen?.(true)
        }}>
            {children && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("inventory.recordWastage", language)} - {vaccine.name}</DialogTitle>
                    <DialogDescription>
                        Record damaged, expired, or otherwise unusable stock for batch {vaccine.batchNumber}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">{t("inventory.wastageQuantity", language)} *</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Enter quantity"
                        />
                        <p className="text-xs text-muted-foreground">Available: {vaccine.quantity} doses</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">{t("inventory.wastageReason", language)} *</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expired">{language === 'am' ? 'ጊዜው ያለፈበት' : 'Expired'}</SelectItem>
                                <SelectItem value="broken_vial">{language === 'am' ? 'የተሰበረ ብልቃጥ' : 'Broken Vial'}</SelectItem>
                                <SelectItem value="temperature_breach">{language === 'am' ? 'የሙቀት መጠን መጣስ' : 'Temperature Breach'}</SelectItem>
                                <SelectItem value="other">{language === 'am' ? 'ሌላ' : 'Other'}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">{t("form.notes", language)} ({t("form.optional", language)})</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Provide details about the wastage"
                        />
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        {t("form.cancel", language)}
                    </Button>
                    <Button onClick={() => {
                        console.log('Record wastage row clicked', { id: vaccine.id, quantity })
                        handleSubmit()
                    }} disabled={loading} variant="destructive">
                        {loading ? "Recording..." : t("inventory.recordWastage", language)}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
