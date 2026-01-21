"use client"

import { Shield, Bell, User, LogOut, Menu, Syringe, AlertTriangle, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { t } from "@/lib/translations"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Badge } from "@/components/ui/badge"
import { logoutUser } from "@/lib/auth-api"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSidebar } from "@/lib/sidebar-context"
import { getNotifications } from "@/lib/parent-api"

export function DashboardHeader() {
  const router = useRouter()
  const { language } = useLanguage()
  const { user, logout } = useUser()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { toast } = useToast()
  const { toggleSidebar } = useSidebar() // Get sidebar toggle function

  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await getNotifications()
        if (data && data.notifications) {
          setNotifications(data.notifications)
        }
      } catch (err) {
        console.error("Failed to fetch header notifications:", err)
      }
    }
    // Only fetch if user is logged in
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutUser()
      logout() // This calls apiClient.clearToken() and sets user to null
      // Give middleware time to process the cookie removal before redirecting
      await new Promise((resolve) => setTimeout(resolve, 100))
      await router.push("/login")
    } catch (error) {
      console.error("[v0] Logout error:", error)
      // Even if logout request fails, clear local state and redirect
      logout()
      await new Promise((resolve) => setTimeout(resolve, 100))
      await router.push("/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) return null

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden lg:flex" title="Toggle sidebar">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2 group transition-all duration-300 hover:opacity-80">
            <div className="group-hover:animate-wiggle transform-gpu transition-transform">
              <Image src="/logo.svg" alt="Logo" width={40} height={40} className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t("dashboard.header.vaxtrack", language)}</h1>
              {/* <p className="text-xs text-muted-foreground">{t("dashboard.header.location", language)}</p> */}
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="text-base font-semibold">
                {t("dashboard.header.notifications", language) || "Notifications"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start py-3 px-3 cursor-pointer hover:bg-muted"
                      onClick={() => {
                        if (user?.role === 'parent') {
                          router.push("/dashboard/settings")
                        } else {
                          router.push("/dashboard/notifications")
                        }
                      }}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="mt-1">
                          {notification.type === "vaccination_reminder" || notification.type === "reminder" ? (
                            <Syringe className="h-4 w-4 text-orange-600" />
                          ) : notification.type === "inventory_alert" || notification.type === "alert" ? (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Bell className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className={`text-sm truncate ${!notification.read ? "font-semibold" : ""}`}>
                            {notification.data?.title || "Notification"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.data?.message || notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1 text-right">
                            {new Date(notification.created_at || notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {language === "am" ? "ምንም አዲስ ማስታወቂያ የለም" : "No new notifications"}
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (user?.role === 'parent') {
                    router.push("/dashboard/settings")
                  } else {
                    router.push("/dashboard/notifications")
                  }
                }}
                className="text-primary font-medium cursor-pointer"
              >
                {language === "am" ? "ሁሉንም ማስታወቂያዎች ይመልከቱ" : "View All Notifications"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.facility}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut
                  ? language === "am"
                    ? "በመውጣት ላይ..."
                    : "Logging out..."
                  : t("dashboard.header.logout", language)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
