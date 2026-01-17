"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useInventory } from "@/lib/inventory-context"

export function AddStockForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { addStock } = useInventory()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    vaccine: "",
    batchNumber: "",
    quantity: "",
    manufacturer: "",
    receivedDate: "",
    expiryDate: "",
    supplier: "",
    storageLocation: "",
    temperature: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.vaccine || !formData.batchNumber || !formData.quantity || !formData.manufacturer) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      addStock({
        name: formData.vaccine,
        batchNumber: formData.batchNumber,
        quantity: Number.parseInt(formData.quantity),
        manufacturer: formData.manufacturer,
        minStock: 200, // Default minimum stock
        expiryDate: formData.expiryDate,
        supplier: formData.supplier,
        storageLocation: formData.storageLocation,
        temperature: formData.temperature,
        notes: formData.notes,
        receivedDate: formData.receivedDate,
        consumption: 0,
      })

      setTimeout(() => {
        router.push("/dashboard/inventory")
      }, 500)
    } catch (err) {
      setError("Failed to add stock. Please try again.")
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
            <Select value={formData.vaccine} onValueChange={(value) => setFormData({ ...formData, vaccine: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectVaccine", language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BCG">BCG</SelectItem>
                <SelectItem value="OPV (Oral Polio)">OPV (Oral Polio)</SelectItem>
                <SelectItem value="Penta (DPT-HepB-Hib)">Penta (DPT-HepB-Hib)</SelectItem>
                <SelectItem value="PCV (Pneumococcal)">PCV (Pneumococcal)</SelectItem>
                <SelectItem value="Rotavirus">Rotavirus</SelectItem>
                <SelectItem value="Measles-Rubella">Measles-Rubella</SelectItem>
                <SelectItem value="IPV (Inactivated Polio)">IPV (Inactivated Polio)</SelectItem>
                <SelectItem value="Yellow Fever">Yellow Fever</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (Doses) *</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="e.g., 500"
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
              placeholder="e.g., BCG-2024-001"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer *</Label>
            <Input
              id="manufacturer"
              placeholder="e.g., Serum Institute"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("form.dateInformation", language)}</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="receivedDate">{t("form.receivedDate", language)} *</Label>
            <Input
              id="receivedDate"
              type="date"
              value={formData.receivedDate}
              onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">{t("form.expiryDate", language)} *</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("form.storageInformation", language)}</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              placeholder="Supplier name"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storageLocation">{t("form.selectLocation", language)} *</Label>
            <Select
              value={formData.storageLocation}
              onValueChange={(value) => setFormData({ ...formData, storageLocation: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectLocation", language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Main Refrigerator">Main Refrigerator</SelectItem>
                <SelectItem value="Backup Refrigerator">Backup Refrigerator</SelectItem>
                <SelectItem value="Freezer">Freezer</SelectItem>
                <SelectItem value="Cold Room">Cold Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="temperature">Storage Temperature (°C) *</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            placeholder="e.g., 2-8"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">Ensure temperature is within recommended range</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("form.additionalInformation", language)}</h3>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information about this stock..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? t("form.addingStock", language) : t("form.addStock", language)}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("form.cancel", language)}
        </Button>
      </div>
    </form>
  )
}
