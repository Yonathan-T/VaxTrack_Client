"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Syringe, Calendar, BarChart3, Package, Settings, LogOut, Bell, User } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { t } from "@/lib/translations"
import { useRouter } from "next/navigation"
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
  const { isCollapsed } = useSidebar()

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
        { title: t("dashboard.nav.vaccinations", language), href: "/dashboard/vaccinations", icon: Syringe },
        { title: t("dashboard.nav.appointments", language), href: "/dashboard/appointments", icon: Calendar },
        { title: t("dashboard.nav.inventory", language), href: "/dashboard/inventory", icon: Package },
      ],
      woreda_officer: [
        { title: t("dashboard.nav.children", language), href: "/dashboard/children", icon: Users },
        { title: t("dashboard.nav.vaccinations", language), href: "/dashboard/vaccinations", icon: Syringe },
        { title: t("dashboard.nav.reports", language), href: "/dashboard/reports", icon: BarChart3 },
      ],
      admin: [
        { title: t("dashboard.nav.children", language), href: "/dashboard/children", icon: Users },
        { title: t("dashboard.nav.vaccinations", language), href: "/dashboard/vaccinations", icon: Syringe },
        { title: t("dashboard.nav.appointments", language), href: "/dashboard/appointments", icon: Calendar },
        { title: t("dashboard.nav.reports", language), href: "/dashboard/reports", icon: BarChart3 },
        { title: t("dashboard.nav.inventory", language), href: "/dashboard/inventory", icon: Package },
        {
          title: t("dashboard.nav.inventoryLogs", language),
          href: "/dashboard/inventory-logs",
          icon: BarChart3,
        },
        { title: t("dashboard.nav.settings", language), href: "/dashboard/settings", icon: Settings },
      ],
      system_administrator: [
        { title: t("dashboard.nav.children", language), href: "/dashboard/children", icon: Users },
        { title: t("dashboard.nav.vaccinations", language), href: "/dashboard/vaccinations", icon: Syringe },
        { title: t("dashboard.nav.appointments", language), href: "/dashboard/appointments", icon: Calendar },
        { title: t("dashboard.nav.reports", language), href: "/dashboard/reports", icon: BarChart3 },
        { title: t("dashboard.nav.inventory", language), href: "/dashboard/inventory", icon: Package },
        {
          title: t("dashboard.nav.inventoryLogs", language),
          href: "/dashboard/inventory-logs",
          icon: BarChart3,
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
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      logout()
      router.push("/login")
      toast({
        title: "Logged out",
        description: language === "am" ? "ስርዓቱን ተወውቁ" : "You have been logged out",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
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

      <div className={cn("pt-4 border-t border-border space-y-3", isCollapsed && "flex flex-col items-center")}>
        {!isCollapsed && (
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground">{language === "am" ? "ያስመረጡ ይዤ:" : "Logged in as:"}</p>
            <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50",
            isCollapsed && "w-10 h-10 p-0 justify-center",
            !isCollapsed && "w-full",
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
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
  )
}
