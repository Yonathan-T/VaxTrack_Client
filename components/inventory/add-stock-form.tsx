"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useInventory } from "@/lib/inventory-context"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/user-context"
import { apiClient } from "@/lib/api-client"

export function AddStockForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { refreshStock, receiveStock } = useInventory()
  const { toast } = useToast()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [availableVaccines, setAvailableVaccines] = useState<Array<{ id: number; name: string; code: string }>>([])
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(false)

  // Fetch available vaccines on mount
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        setIsLoadingVaccines(true)
        // Try to get vaccines from /v1/vaccines endpoint
        const response = await apiClient.get("/v1/vaccines")
        if (response.data && !response.error) {
          const vaccinesData = (response.data as any).data || response.data
          const vaccinesArray = Array.isArray(vaccinesData) ? vaccinesData : []
          setAvailableVaccines(
            vaccinesArray.map((v: any) => ({
              id: v.id,
              name: v.name || v.code,
              code: v.code || "",
            })),
          )
        }
      } catch (err) {
        console.error("[AddStockForm] Error fetching vaccines:", err)
        // Fallback to hardcoded list if API fails
        setAvailableVaccines([
          { id: 1, name: "BCG", code: "BCG" },
          { id: 2, name: "OPV", code: "OPV" },
          { id: 3, name: "Penta", code: "PENTA" },
          { id: 4, name: "PCV", code: "PCV" },
          { id: 5, name: "Rotavirus", code: "ROTA" },
          { id: 6, name: "Measles-Rubella", code: "MEASLES" },
          { id: 7, name: "IPV", code: "IPV" },
        ])
      } finally {
        setIsLoadingVaccines(false)
      }
    }
    fetchVaccines()
  }, [])

  const [formData, setFormData] = useState({
    vaccine_id: "",
    batchNumber: "",
    quantity: "",
    expiryDate: "",
    supplier: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.vaccine_id || !formData.batchNumber || !formData.quantity || !formData.expiryDate) {
      setError("Please fill in all required fields (Vaccine, Batch Number, Quantity, and Expiry Date)")
      return
    }

    setLoading(true)

    try {
      // API expects: vaccine_id, batch_number, quantity, expiry_date, supplier (optional), notes (optional)
      // facility_id is automatically taken from the logged-in user's facility
      const response = await receiveStock({
        vaccine_id: Number.parseInt(formData.vaccine_id),
        batch_number: formData.batchNumber,
        quantity: Number.parseInt(formData.quantity),
        expiry_date: formData.expiryDate,
        supplier: formData.supplier || undefined,
        notes: formData.notes || undefined,
      })

      if (!response.success) {
        setError(response.error || "Failed to add stock. Please try again.")
        setLoading(false)
        return
      }

      toast({
        title: "Success",
        description: "Stock added successfully",
      })


      router.push("/dashboard/inventory")
    } catch (err) {
      setError("Failed to add stock. Please try again.")
      console.error("[AddStockForm] Error:", err)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Vaccine Information</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vaccine">Vaccine Type *</Label>
            {isLoadingVaccines ? (
              <div className="relative">
                <div className="h-10 bg-muted animate-pulse rounded-md" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            ) : (
              <Select
                value={formData.vaccine_id}
                onValueChange={(value) => setFormData({ ...formData, vaccine_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vaccine" />
                </SelectTrigger>
                <SelectContent>
                  {availableVaccines.map((vaccine) => (
                    <SelectItem key={vaccine.id} value={vaccine.id.toString()}>
                      {vaccine.name} {vaccine.code && `(${vaccine.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (Doses) *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="e.g., 100"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="batchNumber">Batch Number *</Label>
            <Input
              id="batchNumber"
              placeholder="e.g., BATCH-2026-X"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier (Optional)</Label>
          <Input
            id="supplier"
            placeholder="e.g., Global Health Supply"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information about this stock..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t">
        <Button type="submit" disabled={loading} className="min-w-[140px]">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding Stock...
            </>
          ) : (
            "Add Stock"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
