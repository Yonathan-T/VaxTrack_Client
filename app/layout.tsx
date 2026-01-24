import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { LanguageProvider } from "@/lib/language-context"
import { ChildrenProvider } from "@/lib/children-context"
import { VaccinationsProvider } from "@/lib/vaccinations-context"
import { InventoryProvider } from "@/lib/inventory-context"
import { UserProvider } from "@/lib/user-context"
import { ThemeProvider } from "@/lib/theme-context"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "VaxTrack - Vaccination Tracking System",
  description: "Children Vaccination Tracking System for Addis Ketema Sub-city",
  generator: "v0.app",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <UserProvider>
              <ChildrenProvider>
                <VaccinationsProvider>
                  <InventoryProvider>{children}</InventoryProvider>
                </VaccinationsProvider>
              </ChildrenProvider>
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
