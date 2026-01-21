"use client"
import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Shield, Users, Calendar, BarChart3, Bell, Database } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { t } from "@/lib/translations"

export default function HomePage() {
  const { language } = useLanguage()
  const { user } = useUser()

  const features = useMemo(
    () => [
      {
        title: t("feature.childRegistration", language),
        description: t("feature.childRegistrationDesc", language),
        icon: Users,
        color: "text-primary",
      },
      {
        title: t("feature.smartScheduling", language),
        description: t("feature.smartSchedulingDesc", language),
        icon: Calendar,
        color: "text-secondary",
      },
      {
        title: t("feature.notifications", language),
        description: t("feature.notificationsDesc", language),
        icon: Bell,
        color: "text-accent",
      },
      {
        title: t("feature.analytics", language),
        description: t("feature.analyticsDesc", language),
        icon: BarChart3,
        color: "text-primary",
      },
      {
        title: t("feature.records", language),
        description: t("feature.recordsDesc", language),
        icon: Database,
        color: "text-secondary",
      },
      {
        title: t("feature.access", language),
        description: t("feature.accessDesc", language),
        icon: Shield,
        color: "text-accent",
      },
    ],
    [language],
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 min-w-0 group transition-all duration-300 hover:opacity-80">
            <div className="group-hover:animate-wiggle transform-gpu transition-transform">
              <Image src="/logo.svg" alt="VaxTrack Logo" width={40} height={40} className="h-12 w-12 sm:h-10 sm:w-10" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">VaxTrack</h1>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {user ? (
              <Link
                href="/dashboard"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Login
              </Link>
            )}
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-64 sm:h-96 md:h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/vaccination-hero.avif"
          alt="Child receiving vaccination"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 md:py-24 flex flex-col items-center justify-center">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6 text-balance">
              {t("home.title", language)}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/90 text-pretty">{t("home.subtitle", language)}</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 md:py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-foreground">
            {t("home.features", language)}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="p-4 sm:p-6 h-full">
                  <Icon className={`h-8 sm:h-10 w-8 sm:w-10 ${feature.color} mb-3 sm:mb-4`} />
                  <h4 className="text-base sm:text-lg font-semibold mb-2 text-card-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">271,664</div>
              <div className="text-sm sm:text-base text-muted-foreground">{t("stats.population", language)}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-secondary mb-2">~8,693</div>
              <div className="text-sm sm:text-base text-muted-foreground">{t("stats.newborns", language)}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">8+</div>
              <div className="text-sm sm:text-base text-muted-foreground">{t("stats.centers", language)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 md:py-16 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-foreground">{t("cta.title", language)}</h3>
          <p className="text-base sm:text-lg text-muted-foreground">{t("cta.subtitle", language)}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="VaxTrack Logo" width={24} height={24} className="h-5 sm:h-6 w-5 sm:w-6" />
              <span className="font-semibold text-foreground">VaxTrack</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("footer.copyright", language)}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
