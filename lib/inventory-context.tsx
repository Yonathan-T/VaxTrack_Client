"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getInventory, getStockAlerts } from "./healthcare-worker-api"

export interface VaccineStock {
  id: string
  name: string
  batchNumber: string
  quantity: number
  minStock: number
  expiryDate: string
  manufacturer: string
  status: "adequate" | "low" | "critical"
  consumption: number
  supplier?: string
  storageLocation?: string
  temperature?: string
  notes?: string
  receivedDate?: string
}

interface InventoryContextType {
  stock: VaccineStock[]
  addStock: (stock: Omit<VaccineStock, "id" | "status">) => void
  updateStock: (id: string, updates: Partial<VaccineStock>) => void
  deleteStock: (id: string) => void
  isLoading: boolean
  error: string | null
  refreshStock: () => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

const initialStock: VaccineStock[] = [
  {
    id: "1",
    name: "BCG",
    batchNumber: "BCG-2024-001",
    quantity: 450,
    minStock: 200,
    expiryDate: "2025-06-15",
    manufacturer: "Serum Institute",
    status: "adequate",
    consumption: 85,
  },
  {
    id: "2",
    name: "Penta (DPT-HepB-Hib)",
    batchNumber: "PENTA-2024-089",
    quantity: 180,
    minStock: 300,
    expiryDate: "2025-03-20",
    manufacturer: "GSK",
    status: "low",
    consumption: 120,
  },
  {
    id: "3",
    name: "OPV (Oral Polio)",
    batchNumber: "OPV-2024-067",
    quantity: 520,
    minStock: 250,
    expiryDate: "2025-08-10",
    manufacturer: "Sanofi",
    status: "adequate",
    consumption: 95,
  },
  {
    id: "4",
    name: "PCV (Pneumococcal)",
    batchNumber: "PCV-2024-123",
    quantity: 150,
    minStock: 200,
    expiryDate: "2024-12-15",
    manufacturer: "Pfizer",
    status: "low",
    consumption: 110,
  },
  {
    id: "5",
    name: "Measles-Rubella",
    batchNumber: "MR-2024-045",
    quantity: 380,
    minStock: 200,
    expiryDate: "2025-04-30",
    manufacturer: "Serum Institute",
    status: "adequate",
    consumption: 75,
  },
  {
    id: "6",
    name: "Rotavirus",
    batchNumber: "ROTA-2024-078",
    quantity: 95,
    minStock: 150,
    expiryDate: "2024-11-25",
    manufacturer: "GSK",
    status: "critical",
    consumption: 88,
  },
]

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [stock, setStock] = useState<VaccineStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshStock = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [inventoryRes, alertsRes] = await Promise.all([getInventory(), getStockAlerts()])

      // Determine if we have a meaningful error (avoid logging empty {})
      const err = (inventoryRes as any)?.error
      const hasMeaningfulError = (() => {
        if (!err) return false
        if (typeof err === "string") return err.trim().length > 0
        if (typeof err === "object") {
          const entries = Object.entries(err as Record<string, unknown>)
          return entries.some(([_, v]) => v !== undefined && v !== null && `${v}`.trim().length > 0)
        }
        return false
      })()

      if (hasMeaningfulError) {
        // Handle different error formats
        let errorMessage = "Failed to load inventory"

        if (typeof err === "string") {
          errorMessage = err
        } else if (err && typeof err === "object") {
          if ("message" in err && err.message) {
            errorMessage = err.message as string
          } else if ("status" in err) {
            const status = (err as any).status as number
            errorMessage = status === 401 || status === 403
              ? "Unauthorized access. Please log in again."
              : status === 404
              ? "Inventory endpoint not found"
              : status >= 500
              ? "Server error. Please try again later."
              : `Failed to load inventory (${status})`
          } else {
            try {
              errorMessage = JSON.stringify(err)
            } catch {
              errorMessage = "Failed to load inventory"
            }
          }
        }

        // Log only meaningful error details
        // console.error("[InventoryContext] Error fetching inventory:", {
        //   message: errorMessage,
        //   status: (err as any)?.status,
        //   code: (err as any)?.code,
        //   details: err,
        // })
        setError(errorMessage)
        setStock([])
        return
      }

      if (inventoryRes.data) {
        // API returns { success: true, data: [...] }
        const responseData = inventoryRes.data as any
        const inventoryArray = Array.isArray(responseData.data) ? responseData.data : Array.isArray(responseData) ? responseData : []

        // Transform API data to match VaccineStock interface
        // API structure: { id, vaccine: {id, name, code}, batch_number, quantity, min_stock, expiry_date, status, etc. }
        const transformedStock: VaccineStock[] = inventoryArray.map((item: any) => {
          const quantity = item.quantity || 0
          const minStock = item.min_stock || item.minStock || 10
          // Use API status if available, otherwise calculate
          const status =
            item.status === "adequate" || item.status === "low" || item.status === "critical"
              ? item.status
              : getStockStatus(quantity, minStock)

          return {
            id: item.id?.toString() || Date.now().toString(),
            name: item.vaccine?.name || item.vaccineName || "Unknown",
            batchNumber: item.batch_number || item.batchNumber || "-",
            quantity,
            minStock,
            expiryDate: item.expiry_date || item.expiryDate || "",
            manufacturer: item.manufacturer || "Unknown",
            status: status as "adequate" | "low" | "critical",
            consumption: item.consumption || 0,
            supplier: item.supplier,
            storageLocation: item.storage_location || item.storageLocation,
            temperature: item.temperature,
            notes: item.notes,
            receivedDate: item.received_date || item.receivedDate,
          }
        })

        setStock(transformedStock)
      } else {
        // No data and no meaningful error: treat as empty inventory without noisy logs
        setStock([])
      }
    } catch (err) {
      console.error("[InventoryContext] Error:", err)
      setError(err instanceof Error ? err.message : "Failed to load inventory")
      setStock([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshStock()
  }, [])

  const getStockStatus = (quantity: number, minStock: number): "adequate" | "low" | "critical" => {
    if (quantity === 0) return "critical"
    if (quantity < minStock * 0.5) return "critical"
    if (quantity < minStock) return "low"
    return "adequate"
  }

  const addStock = (newStock: Omit<VaccineStock, "id" | "status">) => {
    const status = getStockStatus(newStock.quantity, newStock.minStock)
    const id = Date.now().toString()
    setStock([...stock, { ...newStock, id, status }])
  }

  const updateStock = (id: string, updates: Partial<VaccineStock>) => {
    setStock(
      stock.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates }
          const status = getStockStatus(updated.quantity, updated.minStock)
          return { ...updated, status }
        }
        return item
      }),
    )
  }

  const deleteStock = (id: string) => {
    setStock(stock.filter((item) => item.id !== id))
  }

  return (
    <InventoryContext.Provider
      value={{ stock, addStock, updateStock, deleteStock, isLoading, error, refreshStock }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider")
  }
  return context
}
