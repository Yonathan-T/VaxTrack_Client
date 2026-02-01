"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { inventoryApi, type InventoryItem, type InventoryLog } from "./inventory-api"
import { useUser } from "./user-context"

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
  const { user } = useUser()
  const [stock, setStock] = useState<VaccineStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  })

  const refreshStock = async (params?: { page?: number; search?: string; status?: string }) => {
    // Only load inventory for roles that need it
    if (!user || !['admin', 'healthcare_worker', 'system_administrator'].includes(user.role)) {
      setIsLoading(false)
      return
    }

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
        // apiClient unwraps the first 'data' layer, but the backend may have nested it or not
        const rawItems = Array.isArray(response.data)
          ? response.data
          : (response.data as any).data && Array.isArray((response.data as any).data)
            ? (response.data as any).data
            : [];

        const transformed: VaccineStock[] = rawItems.map((item: any) => ({
          ...item,
          name: item.vaccine?.name || "Unknown",
          batchNumber: item.batch_number,
          expiryDate: item.expiry_date,
          minStock: item.min_stock,
          consumption: 0,
        }))

        setStock(transformed)
        setPagination({
          currentPage: (response.data as any).current_page || 1,
          lastPage: (response.data as any).last_page || 1,
          total: (response.data as any).total || (Array.isArray(response.data) ? response.data.length : 0),
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
  }, [user])

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
    console.log('[InventoryContext] recordWastage initiation', { id, type: typeof id, data })
    if (!id || isNaN(id)) {
      console.error('[InventoryContext] Invalid ID provided to recordWastage:', id)
      return { success: false, error: "Invalid ID" }
    }
    try {
      const res = await inventoryApi.wastage(id, data)
      console.log('[InventoryContext] API full response:', res)

      if (res.data || (res.status >= 200 && res.status < 300)) {
        await refreshStock({ page: pagination.currentPage })
        return { success: true }
      }
      return { success: false, error: (res.error as any)?.message || "Failed to record wastage" }
    } catch (err) {
      console.error('[InventoryContext] Exception during recordWastage:', err)
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
