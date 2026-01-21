"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { RoleProtected } from "@/lib/role-protected"
import { Settings, Users, Lock, Bell, Database, AlertCircle, Download, User as UserIcon } from "lucide-react"
import { UserManagement } from "@/components/admin/user-management"
import { SecuritySettings } from "@/components/admin/security-settings"
import { NotificationSettings } from "@/components/admin/notification-settings"
import { BackupManagement } from "@/components/admin/backup-management"
import { SystemSettings } from "@/components/admin/system-settings"
import { SystemTroubleshooting } from "@/components/admin/system-troubleshooting"
import { SystemUpdates } from "@/components/admin/system-updates"
import { ParentSettings } from "@/components/dashboard/parent-settings"
import { UserProfileSettings } from "@/components/dashboard/user-profile-settings"

type Tab = "overview" | "profile" | "notifications" | "backups" | "system" | "troubleshooting" | "updates"

export default function SettingsPage() {
  const { language } = useLanguage()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  const isSystemAdmin = (user?.role as string) === "system_administrator"
  const isParent = user?.role === "parent"

  // Show parent-specific settings
  if (isParent) {
    return <ParentSettings />
  }

  const tabs: { id: Tab; label: string; icon: any; systemAdminOnly?: boolean }[] = [
    {
      id: "overview",
      label: language === "am" ? "ማጠቃለያ" : "Overview",
      icon: Settings,
    },
    {
      id: "profile",
      label: language === "am" ? "መግለጫ" : "Profile",
      icon: UserIcon,
    },
    {
      id: "notifications",
      label: language === "am" ? "ማሳወቂያ" : "Notifications",
      icon: Bell,
    },
    {
      id: "backups",
      label: language === "am" ? "ምደባ" : "Backups",
      icon: Database,
      systemAdminOnly: true,
    },
    {
      id: "system",
      label: language === "am" ? "ስርዓት" : "System",
      icon: Settings,
      systemAdminOnly: true,
    },
    {
      id: "troubleshooting",
      label: language === "am" ? "ችግር ፍታት" : "Troubleshooting",
      icon: AlertCircle,
      systemAdminOnly: true,
    },
    {
      id: "updates",
      label: language === "am" ? "ማሳሪያ" : "Updates",
      icon: Download,
      systemAdminOnly: true,
    },
  ]

  const visibleTabs = tabs.filter((tab) => !tab.systemAdminOnly || isSystemAdmin)

  return (
    <RoleProtected allowedRoles={["admin", "system_administrator", "super_admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{language === "am" ? "ቅንብሮች" : "System Settings"}</h1>
          <p className="text-muted-foreground">
            {language === "am" ? "ስርዓት ቅንብሮች ያስተዳድሩ" : "Manage system configuration"}
          </p>
        </div>

        {/* Tabs - Responsive */}
        <div className="flex overflow-x-auto gap-2 pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:gap-4 md:pb-0 border-b md:border-b-0">
          {visibleTabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id as Tab)}
                className="flex-shrink-0 flex items-center gap-2 whitespace-nowrap"
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Content */}
        <div>
          {activeTab === "overview" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleTabs.slice(1).map((tab) => {
                const IconComponent = tab.icon
                return (
                  <Card
                    key={tab.id}
                    className="p-6 hover:shadow-lg transition cursor-pointer"
                    onClick={() => setActiveTab(tab.id as Tab)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{tab.label}</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          {language === "am"
                            ? tab.id === "notifications"
                              ? "ማሳወቂያ"
                              : tab.id === "backups"
                                ? "ምደባ"
                                : tab.id === "system"
                                  ? "ስርዓት"
                                  : tab.id === "troubleshooting"
                                    ? "ችግር ፍታት"
                                    : "ማሳሪያ"
                            : tab.id === "notifications"
                              ? "Manage notifications"
                              : tab.id === "backups"
                                ? "Database backups"
                                : tab.id === "system"
                                  ? "System configuration"
                                  : tab.id === "troubleshooting"
                                    ? "Troubleshoot system issues"
                                    : "Check for updates"}
                        </p>
                      </div>
                      <IconComponent className="h-6 w-6 text-primary opacity-50" />
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      {language === "am" ? "ይክፈቱ" : "Open"}
                    </Button>
                  </Card>
                )
              })}
            </div>
          )}

          {activeTab === "profile" && <UserProfileSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "backups" && isSystemAdmin && <BackupManagement />}
          {activeTab === "system" && isSystemAdmin && <SystemSettings />}
          {activeTab === "troubleshooting" && isSystemAdmin && <SystemTroubleshooting />}
          {activeTab === "updates" && isSystemAdmin && <SystemUpdates />}
        </div>
      </div>
    </RoleProtected>
  )
}
