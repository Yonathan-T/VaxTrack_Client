"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { inventoryApi, type InventoryItem, type InventoryLog } from "./inventory-api"

export interface VaccineStock extends InventoryItem {
  name: string;
  batchNumber: string;
  expiryDate: string;
  minStock: number;
  consumption: number;
}

interface InventoryContextType {
  stock: VaccineStock[]
  isLoading: boolean
  error: string | null
  refreshStock: (params?: { page?: number; search?: string; status?: string }) => Promise<void>
  receiveStock: (data: Parameters<typeof inventoryApi.receive>[0]) => Promise<{ success: boolean; error?: string }>
  recordWastage: (id: number, data: Parameters<typeof inventoryApi.wastage>[1]) => Promise<{ success: boolean; error?: string }>
  getLogs: (id: number) => Promise<InventoryLog[]>
  pagination: {
    currentPage: number
    lastPage: number
    total: number
  }
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [stock, setStock] = useState<VaccineStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  })

  const refreshStock = async (params?: { page?: number; search?: string; status?: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.list(params)

      if (response.error) {
        // Handle unauthorized or other errors
        const msg = typeof response.error === 'string' ? response.error : (response.error as any).message || "Failed to load inventory"
        setError(msg)
        setStock([])
        return
      }

      if (response.data) {
        // Transformed data to match UI expectations
        const transformed: VaccineStock[] = (response.data.data || []).map((item) => ({
          ...item,
          name: item.vaccine?.name || "Unknown",
          batchNumber: item.batch_number,
          expiryDate: item.expiry_date,
          minStock: item.min_stock,
          consumption: 0,
        }))

        setStock(transformed)
        setPagination({
          currentPage: response.data.current_page || 1,
          lastPage: response.data.last_page || 1,
          total: response.data.total || 0,
        })
      }
    } catch (err) {
      console.error("[InventoryContext] Error:", err)
      setError("An unexpected error occurred while fetching inventory")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshStock()
  }, [])

  const receiveStock = async (data: any) => {
    try {
      const res = await inventoryApi.receive(data)
      if (res.data) {
        refreshStock({ page: pagination.currentPage })
        return { success: true }
      }
      return { success: false, error: (res.error as any)?.message || "Failed to receive stock" }
    } catch (err) {
      return { success: false, error: "Network error while receiving stock" }
    }
  }

  const recordWastage = async (id: number, data: any) => {
    try {
      const res = await inventoryApi.wastage(id, data)
      if (res.data) {
        refreshStock({ page: pagination.currentPage })
        return { success: true }
      }
      return { success: false, error: (res.error as any)?.message || "Failed to record wastage" }
    } catch (err) {
      return { success: false, error: "Network error while recording wastage" }
    }
  }

  const getLogs = async (id: number) => {
    try {
      const res = await inventoryApi.logs(id)
      return res.data?.data || []
    } catch (err) {
      console.error("[InventoryContext] Error fetching logs:", err)
      return []
    }
  }

  return (
    <InventoryContext.Provider
      value={{
        stock,
        isLoading,
        error,
        refreshStock,
        receiveStock,
        recordWastage,
        getLogs,
        pagination,
      }}
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
