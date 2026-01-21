"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useInventory } from "@/lib/inventory-context"
import { Search, Loader2, Check, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandInput as CommandInputPrimitive, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface GlobalWastageModalProps {
    children?: React.ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function GlobalWastageModal({ children, isOpen: ControlledOpen, onOpenChange: setControlledOpen }: GlobalWastageModalProps) {
    const { toast } = useToast()
    const { language } = useLanguage()
    const { stock, recordWastage, isLoading: isInventoryLoading } = useInventory()

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const isControlled = ControlledOpen !== undefined
    const isOpen = isControlled ? ControlledOpen : uncontrolledOpen
    const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen

    const [selectedItemId, setSelectedItemId] = useState<string>("")
    const [quantity, setQuantity] = useState("")
    const [reason, setReason] = useState("expired")
    const [notes, setNotes] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [popoverOpen, setPopoverOpen] = useState(false)

    const selectedItem = useMemo(() => {
        const item = stock.find((s: any) => s.id.toString() === selectedItemId)
        console.log('Selected item changed:', item?.name, item?.batchNumber)
        return item
    }, [stock, selectedItemId])

    const filteredStock = useMemo(() => {
        // Only show items that are actually in stock (quantity > 0)
        const inStockItems = stock.filter((s: any) => s.quantity > 0)

        if (!searchTerm) return inStockItems.slice(0, 20)

        return inStockItems.filter((s: any) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 20)
    }, [stock, searchTerm])

    const handleSubmit = async () => {
        console.log('[GlobalWastageModal] handleSubmit triggered', { selectedItemId, quantity, reason })
        if (!selectedItemId) {
            console.log('[GlobalWastageModal] No selected item')
            toast({
                title: t("form.fillRequiredFields", language),
                variant: "destructive",
            })
            return
        }

        const qty = Number.parseInt(quantity)
        if (!quantity || isNaN(qty) || qty <= 0) {
            console.log('[GlobalWastageModal] Validation failed: Invalid quantity', { quantity, qty })
            toast({
                title: "Invalid quantity",
                description: "Please enter a valid positive number",
                variant: "destructive",
            })
            return
        }

        if (selectedItem && qty > selectedItem.quantity) {
            console.log('[GlobalWastageModal] Validation failed: Insufficient stock', { qty, available: selectedItem.quantity })
            toast({
                title: "Insufficient stock",
                description: "Wastage quantity cannot exceed current stock",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)
        try {
            const id = Number.parseInt(selectedItemId)
            console.log('[GlobalWastageModal] Calling recordWastage with ID:', id)
            const result = await recordWastage(id, {
                quantity: qty,
                reason,
                notes,
            })
            console.log('[GlobalWastageModal] recordWastage result:', result)

            if (result.success) {
                toast({
                    title: t("inventory.wastageSuccess", language),
                })
                handleClose()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to record wastage",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setSelectedItemId("")
        setQuantity("")
        setReason("expired")
        setNotes("")
        setSearchTerm("")
        if (setOpen) setOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {children && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t("inventory.recordWastage", language)}</DialogTitle>
                    <DialogDescription>
                        Record vaccine wastage for any batch in the inventory.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>{t("inventory.selectBatch", language)} *</Label>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between font-normal",
                                        !selectedItemId && "text-muted-foreground"
                                    )}
                                >
                                    {selectedItem
                                        ? `${selectedItem.name} (${selectedItem.batchNumber})`
                                        : isInventoryLoading ? "Loading inventory..." : t("inventory.selectBatch", language)}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[450px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search vaccine or batch..." />
                                    <CommandList>
                                        <CommandEmpty>No matches found</CommandEmpty>
                                        <CommandGroup>
                                            {stock.filter((s: any) => s.quantity > 0).map((item: any) => (
                                                <CommandItem
                                                    key={item.id}
                                                    value={`${item.name} ${item.batchNumber}`}
                                                    onSelect={() => {
                                                        console.log('[GlobalWastageModal] Item selected:', item.id, item.name)
                                                        setSelectedItemId(item.id.toString())
                                                        setPopoverOpen(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedItemId === item.id.toString() ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{item.name}</span>
                                                        <span className="text-[10px] text-muted-foreground font-mono">
                                                            Batch: {item.batchNumber} | Avail: {item.quantity} doses
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {selectedItem && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">{t("inventory.wastageQuantity", language)} *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Available: {selectedItem.quantity} doses</p>
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">{t("form.notes", language)} (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Provide details about the wastage"
                                    rows={3}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-3 justify-end pt-4">
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        {t("form.cancel", language)}
                    </Button>
                    <Button onClick={() => {
                        console.log('Submit clicked', { selectedItemId, quantity })
                        handleSubmit()
                    }} disabled={isSubmitting} variant="destructive">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {t("inventory.recordWastage", language)}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
