"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useInventory } from "@/lib/inventory-context"

interface WastageModalProps {
    isOpen: boolean
    onClose: () => void
    vaccine: {
        id: number
        name: string
        quantity: number
        batch_number: string
    }
}

export function WastageModal({ isOpen, onClose, vaccine }: WastageModalProps) {
    const { toast } = useToast()
    const { language } = useLanguage()
    const { recordWastage } = useInventory()
    const [quantity, setQuantity] = useState("")
    const [reason, setReason] = useState("expired")
    const [notes, setNotes] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
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
            onClose()
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to record wastage",
                variant: "destructive",
            })
        }
        setLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record Wastage - {vaccine.name}</DialogTitle>
                    <DialogDescription>
                        Record damaged, expired, or otherwise unusable stock for batch {vaccine.batch_number}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity to Remove *</Label>
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
                        <Label htmlFor="reason">Reason for Wastage *</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="vial_contamination">Vial Contamination</SelectItem>
                                <SelectItem value="cold_chain_failure">Cold Chain Failure</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Provide details about the wastage"
                        />
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        {t("form.cancel", language)}
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} variant="destructive">
                        {loading ? "Recording..." : "Record Wastage"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
