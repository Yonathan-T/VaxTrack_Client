"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { childrenTranslations } from "./children-translations"
import { getChildren as fetchChildrenFromAPI } from "./parent-api"
import type { Language } from "./translations"

export interface Child {
  id: string
  vaccineId: string
  firstName: string
  middleName: string
  lastName: string
  dateOfBirth: string
  gender: string
  placeOfBirth: string
  birthWeight: string
  guardianFirstName: string
  guardianLastName: string
  relationship: string
  guardianPhone: string
  guardianEmail: string
  kebele: string
  woreda: string
  houseNumber: string
  notes: string
  parentId?: string
}

interface ChildrenContextType {
  children: Child[]
  addChild: (child: Omit<Child, "id">) => void
  updateChild: (id: string, child: Partial<Child>) => void
  deleteChild: (id: string) => void
  getChildrenByParent: (parentId: string) => Child[]
  isLoading: boolean
  error: string | null
  refreshChildren: () => Promise<void>
}

const ChildrenContext = createContext<ChildrenContextType | undefined>(undefined)

const getInitialMockChildren = (language: Language): Child[] => {
  const translations = childrenTranslations[language]
  return translations.map((translated) => ({
    id: translated.id,
    vaccineId: `vac${String(Number.parseInt(translated.id)).padStart(6, "0")}`,
    firstName: translated.firstName,
    middleName: translated.middleName,
    lastName: translated.lastName,
    dateOfBirth: language === "am" ? "2024-03-15" : "2024-03-15",
    gender: translated.id === "2" || translated.id === "4" ? "female" : "male",
    placeOfBirth: translated.placeOfBirth,
    birthWeight: translated.id === "1" ? "3.5" : translated.id === "2" ? "3.2" : translated.id === "3" ? "3.8" : "3.1",
    guardianFirstName: translated.guardianFirstName,
    guardianLastName: translated.guardianLastName,
    relationship: translated.id === "3" ? "father" : "mother",
    guardianPhone:
      translated.id === "1"
        ? "+251911234567"
        : translated.id === "2"
          ? "+251922345678"
          : translated.id === "3"
            ? "+251933456789"
            : "+251944567890",
    guardianEmail:
      translated.id === "1"
        ? "almaz@example.com"
        : translated.id === "2"
          ? "meseret@example.com"
          : translated.id === "3"
            ? "hanna@example.com"
            : "bethlehem@example.com",
    kebele: translated.kebele,
    woreda: translated.woreda,
    houseNumber: translated.id === "1" ? "123" : translated.id === "2" ? "456" : translated.id === "3" ? "789" : "321",
    notes: "",
    parentId: translated.id === "1" || translated.id === "2" ? "parent_1" : "parent_2",
  }))
}

export function ChildrenProvider({ children }: { children: React.ReactNode }) {
  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [mounted, setMounted] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshChildren = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      if (token) {
        const { data, error: apiError } = await fetchChildrenFromAPI()

        if (apiError) {
          console.warn("[v0] API fetch failed, falling back to mock data:", apiError.message)
          const savedChildren = localStorage.getItem("children")
          setChildrenList(savedChildren ? JSON.parse(savedChildren) : getInitialMockChildren(currentLanguage))
        } else if (data) {
          const childrenData = (data as any).children || data
          if (Array.isArray(childrenData)) {
            setChildrenList(childrenData)
            localStorage.setItem("children", JSON.stringify(childrenData))
          }
        }
      } else {
        const savedChildren = localStorage.getItem("children")
        if (savedChildren) {
          setChildrenList(JSON.parse(savedChildren))
        } else {
          setChildrenList(getInitialMockChildren(currentLanguage))
        }
      }
    } catch (err) {
      console.error("Error refreshing children:", err)
      setError("Failed to load children")
      const savedChildren = localStorage.getItem("children")
      if (savedChildren) {
        setChildrenList(JSON.parse(savedChildren))
      } else {
        setChildrenList(getInitialMockChildren(currentLanguage))
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language | null
    const language = (
      savedLanguage && (savedLanguage === "en" || savedLanguage === "am") ? savedLanguage : "en"
    ) as Language
    setCurrentLanguage(language)

    const savedChildren = localStorage.getItem("children")
    if (savedChildren) {
      try {
        const parsedChildren = JSON.parse(savedChildren)
        const childrenWithVaccineIds = parsedChildren.map((child: Child) => ({
          ...child,
          vaccineId: child.vaccineId || `vac${String(Number.parseInt(child.id)).padStart(6, "0")}`,
        }))
        setChildrenList(childrenWithVaccineIds)
      } catch (error) {
        console.error("Failed to load children from localStorage:", error)
        setChildrenList(getInitialMockChildren(language))
      }
    } else {
      setChildrenList(getInitialMockChildren(language))
    }

    refreshChildren()
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleLanguageChange = () => {
      const savedLanguage = localStorage.getItem("language") as Language | null
      const language = (
        savedLanguage && (savedLanguage === "en" || savedLanguage === "am") ? savedLanguage : "en"
      ) as Language

      if (language !== currentLanguage) {
        setCurrentLanguage(language)
        const savedChildren = localStorage.getItem("children")
        if (!savedChildren) {
          setChildrenList(getInitialMockChildren(language))
        }
      }
    }

    window.addEventListener("storage", handleLanguageChange)
    const interval = setInterval(handleLanguageChange, 500)

    return () => {
      window.removeEventListener("storage", handleLanguageChange)
      clearInterval(interval)
    }
  }, [currentLanguage])

  const addChild = (childData: Omit<Child, "id" | "vaccineId">) => {
    const newChild: Child = {
      ...childData,
      id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      vaccineId: `vac${Date.now().toString().slice(-6)}`,
    }
    const updatedChildren = [...childrenList, newChild]
    setChildrenList(updatedChildren)
    localStorage.setItem("children", JSON.stringify(updatedChildren))
  }

  const updateChild = (id: string, childData: Partial<Child>) => {
    const updatedChildren = childrenList.map((child) => (child.id === id ? { ...child, ...childData } : child))
    setChildrenList(updatedChildren)
    localStorage.setItem("children", JSON.stringify(updatedChildren))
  }

  const deleteChild = (id: string) => {
    const updatedChildren = childrenList.filter((child) => child.id !== id)
    setChildrenList(updatedChildren)
    localStorage.setItem("children", JSON.stringify(updatedChildren))
  }

  const getChildrenByParent = (parentId: string) => {
    return childrenList.filter((child) => child.parentId === parentId)
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ChildrenContext.Provider
      value={{
        children: childrenList,
        addChild,
        updateChild,
        deleteChild,
        getChildrenByParent,
        isLoading,
        error,
        refreshChildren,
      }}
    >
      {children}
    </ChildrenContext.Provider>
  )
}

export function useChildren() {
  const context = useContext(ChildrenContext)
  if (context === undefined) {
    throw new Error("useChildren must be used within a ChildrenProvider")
  }
  return context
}
