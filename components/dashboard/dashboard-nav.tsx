"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Syringe, Calendar, BarChart3, Package, Settings, LogOut, Bell, User, History, Building, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { t } from "@/lib/translations"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logoutParent } from "@/lib/parent-api"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSidebar } from "@/lib/sidebar-context"

interface NavItem {
  title: string
  href: string
  icon: any
  allowedRoles?: string[]
}

export function DashboardNav() {
  const pathname = usePathname()
  const { language } = useLanguage()
  const { user, logout } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        title: t("dashboard.nav.dashboard", language),
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ]

    const roleItems: Record<string, NavItem[]> = {
      healthcare_worker: [
        { title: t("dashboard.nav.children", language), href: "/dashboard/children", icon: Users },
        { title: t("dashboard.nav.appointments", language), href: "/dashboard/appointments", icon: Calendar },
        { title: t("dashboard.nav.inventory", language), href: "/dashboard/inventory", icon: Package },
        { title: t("dashboard.nav.inventoryLogs", language), href: "/dashboard/inventory-logs", icon: History },
        { title: t("dashboard.nav.campaigns", language), href: "/dashboard/campaigns", icon: Syringe },
        { title: t("dashboard.nav.settings", language), href: "/dashboard/settings", icon: Settings },
      ],
      woreda_officer: [
        { title: t("dashboard.nav.reports", language), href: "/dashboard/reports", icon: BarChart3 },
      ],
      health_official: [
        { title: t("dashboard.nav.reports", language), href: "/dashboard/reports", icon: BarChart3 },
        { title: t("dashboard.nav.inventory", language), href: "/dashboard/inventory", icon: Package },
        { title: t("dashboard.nav.inventoryLogs", language), href: "/dashboard/inventory-logs", icon: History },
        { title: t("dashboard.nav.campaigns", language), href: "/dashboard/campaigns", icon: Syringe },
        { title: t("dashboard.nav.settings", language), href: "/dashboard/settings", icon: Settings },
      ],
      admin: (() => {
        const isSuperAdmin = user?.role === "admin" && (user as any)?.facility_id == null
        const isLocalAdmin = user?.role === "admin" && (user as any)?.facility_id != null
        const items: NavItem[] = []
        // Common admin features
        items.push({ title: t("dashboard.nav.children", language), href: "/dashboard/children", icon: Users })
        // Users should appear right below Children
        items.push({ title: t("dashboard.nav.users", language), href: "/dashboard/users", icon: Users })
        // Then the rest
        items.push({ title: t("dashboard.nav.appointments", language), href: "/dashboard/appointments", icon: Calendar })
        // Super admin specific: Global Reports
        if (isSuperAdmin) {
          items.push({ title: t("dashboard.nav.facilities", language), href: "/dashboard/facilities", icon: Building })
          items.push({ title: t("dashboard.nav.reports", language), href: "/dashboard/reports", icon: BarChart3 })
          items.push({ title: t("dashboard.nav.inventory", language), href: "/dashboard/inventory", icon: Package })
          items.push({ title: t("dashboard.nav.inventoryLogs", language), href: "/dashboard/inventory-logs", icon: History })
        }
        // Local admin specific: Inventory for own facility, facility-scoped reports
        if (isLocalAdmin) {
          items.push({ title: t("dashboard.nav.inventory", language), href: "/dashboard/inventory", icon: Package })
          items.push({ title: t("dashboard.nav.inventoryLogs", language), href: "/dashboard/inventory-logs", icon: History })
          items.push({ title: t("dashboard.nav.reports", language), href: "/dashboard/reports", icon: BarChart3 })
        }
        // Always show settings at the end for admin
        items.push({ title: t("dashboard.nav.settings", language), href: "/dashboard/settings", icon: Settings })
        return items
      })(),
      system_administrator: [
        { title: t("dashboard.nav.children", language), href: "/dashboard/children", icon: Users },
        { title: "Users", href: "/dashboard/users", icon: Users },
        { title: t("dashboard.nav.appointments", language), href: "/dashboard/appointments", icon: Calendar },
        { title: t("dashboard.nav.reports", language), href: "/dashboard/reports", icon: BarChart3 },
        { title: t("dashboard.nav.inventory", language), href: "/dashboard/inventory", icon: Package },
        {
          title: t("dashboard.nav.inventoryLogs", language),
          href: "/dashboard/inventory-logs",
          icon: History,
        },
        { title: t("dashboard.nav.settings", language), href: "/dashboard/settings", icon: Settings },
      ],
      parent: [
        { title: t("dashboard.nav.settings", language), href: "/dashboard/settings", icon: Settings },
      ],
    }

    const role = user?.role as string
    const navItems = roleItems[role] || []
    return [...baseItems, ...navItems]
  }

  const navItems = getNavItems()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutParent()
      logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      logout()
      router.push("/")
      toast({
        title: "Logged out",
        description: language === "am" ? "ስርዓቱን ተወውቁ" : "You have been logged out",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const { isCollapsed, mobileMenuOpen, setMobileMenuOpen } = useSidebar()

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className={cn(
          "border-r border-border bg-card hidden lg:flex flex-col justify-between fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-hidden z-20 transition-all duration-300",
          isCollapsed ? "w-20 p-2" : "w-64 p-4",
        )}
      >
        <div className="space-y-2 overflow-y-auto flex-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )
          })}

        </div>

        <div className={cn("pt-4 mt-auto border-t border-border", isCollapsed && "flex flex-col items-center")}>
          {!isCollapsed && (
            <div className="mx-3 mb-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              {user?.role && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-primary capitalize">
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50",
              "text-destructive hover:bg-destructive/10 hover:text-destructive",
              isCollapsed && "w-10 h-10 p-0 justify-center mx-auto",
              !isCollapsed && "w-full mx-3 mb-3",
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <span>
                {isLoggingOut
                  ? language === "am"
                    ? "በመውጣት ላይ..."
                    : "Logging out..."
                  : language === "am"
                    ? "ውጣ"
                    : "Logout"}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        )}
        <div
          className={cn(
            "fixed top-0 left-0 h-screen w-72 bg-card border-r border-border z-50 transition-transform duration-300 flex flex-col shadow-2xl",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Mobile Menu Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="VaxTrack" width={32} height={32} />
                <h2 className="text-lg font-bold">VaxTrack</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>

          <div className="p-4 border-t border-border bg-card">
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 mb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              {user?.role && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-primary capitalize">
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50 w-full"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>
                {isLoggingOut
                  ? language === "am"
                    ? "በመውጣት ላይ..."
                    : "Logging out..."
                  : language === "am"
                    ? "ውጣ"
                    : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

