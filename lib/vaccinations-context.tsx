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

const initialMockVaccinations: Vaccination[] = [
  {
    id: "vac_1",
    childId: "1",
    vaccine: "BCG",
    date: "2024-03-15",
    batchNumber: "BCG-2024-001",
    facility: "Addis Ketema Health Center",
    administeredBy: "Nurse Tigist Alemu",
    status: "completed",
    nextDue: "Penta 1 - 2024-05-15",
  },
  {
    id: "vac_2",
    childId: "2",
    vaccine: "Measles",
    date: "2024-10-15",
    batchNumber: "MEASLES-2024-034",
    facility: "Addis Ketema Health Center",
    administeredBy: "Nurse Meseret Bekele",
    status: "completed",
    nextDue: "Complete",
  },
  {
    id: "vac_3",
    childId: "3",
    vaccine: "Penta 2",
    date: "2024-08-20",
    batchNumber: "PENTA-2024-089",
    facility: "Woreda 03 Clinic",
    administeredBy: "Nurse Hanna Tesfaye",
    status: "completed",
    nextDue: "Penta 3 - 2024-10-20",
  },
  {
    id: "vac_4",
    childId: "4",
    vaccine: "OPV 2",
    date: "2024-06-28",
    batchNumber: "OPV-2024-067",
    facility: "Addis Ketema Health Center",
    administeredBy: "Nurse Tigist Alemu",
    status: "completed",
    nextDue: "OPV 3 - 2024-08-28",
  },
  {
    id: "vac_5",
    childId: "1",
    vaccine: "Penta 1",
    date: "2024-05-20",
    batchNumber: "PENTA-2024-045",
    facility: "Addis Ketema Health Center",
    administeredBy: "Nurse Tigist Alemu",
    status: "scheduled",
    nextDue: "2024-11-20",
  },
  {
    id: "vac_6",
    childId: "2",
    vaccine: "OPV 1",
    date: "2024-11-01",
    batchNumber: "OPV-2024-089",
    facility: "Woreda 03 Clinic",
    administeredBy: "Nurse Hanna Tesfaye",
    status: "overdue",
    nextDue: "2024-10-15",
  },
]

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
