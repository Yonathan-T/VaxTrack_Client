"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Vaccination {
  id: string
  childId: string
  vaccine: string
  date: string
  batchNumber: string
  facility: string
  administeredBy: string
  status: "completed" | "scheduled" | "overdue"
  nextDue: string
}

interface VaccinationsContextType {
  vaccinations: Vaccination[]
  addVaccination: (vaccination: Omit<Vaccination, "id">) => void
}

const VaccinationsContext = createContext<VaccinationsContextType | undefined>(undefined)

const initialMockVaccinations: Vaccination[] = []

export function VaccinationsProvider({ children }: { children: React.ReactNode }) {
  const [vaccinationsList, setVaccinationsList] = useState<Vaccination[]>(initialMockVaccinations)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load vaccinations from localStorage on mount
    const savedVaccinations = localStorage.getItem("vaccinations")
    if (savedVaccinations) {
      try {
        setVaccinationsList(JSON.parse(savedVaccinations))
      } catch (error) {
        console.error("Failed to load vaccinations from localStorage:", error)
      }
    }
    setMounted(true)
  }, [])

  const addVaccination = (vaccinationData: Omit<Vaccination, "id">) => {
    const newVaccination: Vaccination = {
      ...vaccinationData,
      id: `vac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    const updatedVaccinations = [...vaccinationsList, newVaccination]
    setVaccinationsList(updatedVaccinations)
    // Save to localStorage
    localStorage.setItem("vaccinations", JSON.stringify(updatedVaccinations))
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <VaccinationsContext.Provider value={{ vaccinations: vaccinationsList, addVaccination }}>
      {children}
    </VaccinationsContext.Provider>
  )
}

export function useVaccinations() {
  const context = useContext(VaccinationsContext)
  if (context === undefined) {
    throw new Error("useVaccinations must be used within a VaccinationsProvider")
  }
  return context
}
