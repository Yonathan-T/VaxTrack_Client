"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

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
  const [stock, setStock] = useState<VaccineStock[]>(initialStock)

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
    <InventoryContext.Provider value={{ stock, addStock, updateStock, deleteStock }}>
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
