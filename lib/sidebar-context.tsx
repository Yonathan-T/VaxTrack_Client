"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
  isCollapsed: boolean
  toggleSidebar: () => void
  mobileMenuOpen: boolean
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
    setIsMounted(true)
  }, [])

  // Save to localStorage when collapsed state changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed))
    }
  }, [isCollapsed, isMounted])

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev)
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, mobileMenuOpen, toggleMobileMenu, setMobileMenuOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return context
}
