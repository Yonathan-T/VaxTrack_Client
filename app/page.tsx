"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Shield, Users, Calendar, BarChart3, Bell, Database, CheckCircle2, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { FloatingNavbar } from "@/components/landing/floating-navbar"
import { FaqSection } from "@/components/landing/faq-section"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const { language } = useLanguage()
  const { user } = useUser()

  const features = useMemo(
    () => [
      {
        title: t("feature.childRegistration", language),
        description: t("feature.childRegistrationDesc", language),
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/10",
      },
      {
        title: t("feature.smartScheduling", language),
        description: t("feature.smartSchedulingDesc", language),
        icon: Calendar,
        color: "text-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-900/10",
      },
      {
        title: t("feature.notifications", language),
        description: t("feature.notificationsDesc", language),
        icon: Bell,
        color: "text-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-900/10",
      },
      {
        title: t("feature.analytics", language),
        description: t("feature.analyticsDesc", language),
        icon: BarChart3,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/10",
      },
      {
        title: t("feature.records", language),
        description: t("feature.recordsDesc", language),
        icon: Database,
        color: "text-rose-600",
        bgColor: "bg-rose-50 dark:bg-rose-900/10",
      },
      {
        title: t("feature.access", language),
        description: t("feature.accessDesc", language),
        icon: Shield,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/10",
      },
    ],
    [language],
  )

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <FloatingNavbar />

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full border-primary/20 bg-primary/10 text-primary animate-fade-in">
                {t("landing.hero.badge" as any, language)}
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                {t("landing.hero.title" as any, language)} <span className="text-primary italic">{t("landing.hero.titleHighlight" as any, language)}</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t("landing.hero.subtitle" as any, language)}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                <Link href={user ? "/dashboard" : "/login"}>
                  <Button size="lg" className="rounded-full px-8 py-7 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 group">
                    {user ? t("landing.hero.ctaPrimaryAuth" as any, language) : t("landing.hero.ctaPrimary" as any, language)}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#about">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-7 text-lg bg-transparent border-border hover:bg-muted/50 transition-all">
                    {t("landing.hero.ctaSecondary" as any, language)}
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">270K+</span>
                  <span className="text-xs uppercase tracking-widest font-semibold">{t("landing.hero.stat1Label" as any, language)}</span>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">100%</span>
                  <span className="text-xs uppercase tracking-widest font-semibold">{t("landing.hero.stat2Label" as any, language)}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative w-full max-w-xl group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border-8 border-background/50 shadow-2xl">
                <Image
                  src="/images/vaccination-hero.avif"
                  alt="VaxTrack Platform in action"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-background p-6 rounded-3xl shadow-xl border border-border/50 animate-bounce-subtle hidden sm:block">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{t("landing.hero.cardTitle" as any, language)}</h4>
                    <p className="text-xs text-muted-foreground">{t("landing.hero.cardSubtitle" as any, language)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-muted/30 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">{t("landing.about.title" as any, language)}</h2>
              <div className="w-20 h-1.5 bg-primary rounded-full" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("landing.about.description" as any, language)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                {[
                  t("landing.about.benefit1" as any, language),
                  t("landing.about.benefit2" as any, language),
                  t("landing.about.benefit3" as any, language),
                  t("landing.about.benefit4" as any, language)
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full bg-card rounded-[2rem] p-8 border border-border shadow-soft relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Users size={200} />
              </div>
              <h3 className="text-2xl font-bold mb-6">{t("landing.about.impactTitle" as any, language)}</h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-sm">{t("landing.about.metric1" as any, language)}</span>
                    <span className="text-emerald-500 font-bold">95%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-grow-x" style={{ width: "95%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-sm">{t("landing.about.metric2" as any, language)}</span>
                    <span className="text-emerald-500 font-bold">100%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-grow-x delay-300" style={{ width: "100%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-sm">{t("landing.about.metric3" as any, language)}</span>
                    <span className="text-emerald-500 font-bold">{t("landing.about.metric3Value" as any, language)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-grow-x delay-500" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t("landing.features.title" as any, language)}</h2>
            <p className="text-lg text-muted-foreground">{t("landing.features.subtitle" as any, language)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="p-8 border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={cn("inline-flex p-4 rounded-2xl mb-6 transition-transform duration-500 group-hover:scale-110", feature.bgColor, feature.color)}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

                  <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <FaqSection />

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-primary rounded-[3rem] p-12 lg:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl shadow-primary/30">
            {/* Animated bg circles */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
              <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] border-[50px] border-white/10 rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl" />
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">{t("landing.cta.title" as any, language)}</h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">{t("landing.cta.subtitle" as any, language)}</p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-4">
              <Link href={user ? "/dashboard" : "/login"}>
                <Button size="lg" className="rounded-full px-10 py-7 text-lg bg-background text-primary hover:bg-white transition-all shadow-xl shadow-black/10">
                  {user ? t("landing.cta.primaryAuth" as any, language) : t("landing.cta.primary" as any, language)}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="rounded-full px-10 py-7 text-lg border-primary-foreground/50 text-primary-foreground hover:bg-white/10 transition-all bg-transparent">
                  {t("landing.cta.secondary" as any, language)}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
