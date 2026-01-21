"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useInventory, type VaccineStock } from "@/lib/inventory-context"
import { type InventoryLog } from "@/lib/inventory-api"
import { Loader2, ArrowUpRight, ArrowDownLeft, Info } from "lucide-react"
import { format } from "date-fns"

interface InventoryLogsModalProps {
    isOpen: boolean
    onClose: () => void
    vaccine: VaccineStock
}

export function InventoryLogsModal({ isOpen, onClose, vaccine }: InventoryLogsModalProps) {
    const { getLogs } = useInventory()
    const [logs, setLogs] = useState<InventoryLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            const fetchLogs = async () => {
                setLoading(true)
                const data = await getLogs(vaccine.id)
                setLogs(data)
                setLoading(false)
            }
            fetchLogs()
        }
    }, [isOpen, vaccine.id])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Audit Logs - {vaccine.name}</DialogTitle>
                    <DialogDescription>
                        Transaction history for batch {vaccine.batch_number}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No history found for this item
                        </div>
                    ) : (
                        <div className="relative space-y-4">
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-border ml-[2px]" />
                            {logs.map((log) => (
                                <div key={log.id} className="relative pl-10">
                                    <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-2 bg-background flex items-center justify-center z-10 ${log.action === 'receive' ? 'border-green-500' :
                                            log.action === 'wastage' ? 'border-red-500' :
                                                log.action === 'consume' ? 'border-blue-500' : 'border-gray-500'
                                        }`}>
                                        {log.action === 'receive' && <ArrowUpRight className="h-3 w-3 text-green-500" />}
                                        {log.action === 'wastage' && <ArrowDownLeft className="h-3 w-3 text-red-500" />}
                                        {log.action === 'consume' && <ArrowDownLeft className="h-3 w-3 text-blue-500" />}
                                        {log.action !== 'receive' && log.action !== 'wastage' && log.action !== 'consume' && <Info className="h-3 w-3 text-gray-500" />}
                                    </div>

                                    <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold capitalize text-sm">{log.action.replace('_', ' ')}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm mt-1">
                                            <div>
                                                <span className="text-muted-foreground">Change: </span>
                                                <span className={log.quantity > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                                    {log.quantity > 0 ? '+' : ''}{log.quantity}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">After: </span>
                                                <span className="font-medium">{log.previous_quantity + log.quantity}</span>
                                            </div>
                                        </div>

                                        {log.notes && (
                                            <p className="text-xs text-muted-foreground mt-2 italic">
                                                "{log.notes}"
                                            </p>
                                        )}

                                        <div className="text-[10px] text-muted-foreground uppercase pt-1">
                                            By {log.user?.name || 'System'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
