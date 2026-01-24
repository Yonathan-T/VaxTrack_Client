"use client"

import Image from "next/image"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { Shield } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-primary p-12 flex-col justify-between text-primary-foreground relative overflow-hidden">
        {/* Logo and Home Link (Desktop) */}
        <div className="relative z-20">
          <Link href="/" className="flex items-center gap-2 group w-fit text-white">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md group-hover:scale-105 transition-transform duration-300">
              <Image src="/logo.svg" alt="VaxTrack" width={32} height={32} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white uppercase italic">VaxTrack</span>
          </Link>
        </div>

        <Image
          src="/images/vaccination-new.jpg"
          alt="Child receiving vaccination"
          fill
          priority
          loading="eager"
          className="object-cover absolute inset-0 transition-transform duration-[10s] hover:scale-110"
        />
        {/* Sophisticated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent z-10" />

        <div className="relative z-20 mt-auto space-y-6">
          <Badge variant="outline" className="text-white border-white/30 px-3 py-1 bg-white/10 backdrop-blur-md">
            Trusted Platform
          </Badge>
          <h2 className="text-5xl lg:text-6xl font-extrabold text-balance leading-[1.1] text-white">
            {t("login.title", language)}
          </h2>
          <div className="flex items-center justify-between pt-8 border-t border-white/20">
            <p className="text-sm font-medium text-white/80">{t("login.serving", language)}</p>
            <div className="flex gap-4">
              <div className="h-2 w-8 bg-white/40 rounded-full" />
              <div className="h-2 w-2 bg-white/20 rounded-full" />
              <div className="h-2 w-2 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-background relative">
        {/* Header Actions (Floating) */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Logo (Mobile) */}
          <div className="md:hidden flex justify-center mb-8">
            <Link href="/" className="flex flex-col items-center gap-2">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Image src="/logo.svg" alt="VaxTrack" width={40} height={40} />
              </div>
              <span className="text-xl font-bold text-primary italic">VaxTrack</span>
            </Link>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              {t("login.welcome", language)}
            </h2>
            <p className="text-muted-foreground">{t("login.signIn", language)}</p>
          </div>

          <Card className="p-1 border-none bg-transparent shadow-none">
            <LoginForm />
          </Card>

          <footer className="pt-8 border-t border-border flex flex-col items-center gap-6">
            <p className="text-sm text-muted-foreground text-center">
              {t("login.noAccount", language)}{" "}
              <Link href="/register" className="font-bold text-primary hover:underline transition-all">
                {t("login.registerHere", language)}
              </Link>
            </p>

            <div className="flex items-center gap-4 opacity-50 text-xs">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>•</span>
              <span className="cursor-default">Privacy</span>
              <span>•</span>
              <span className="cursor-default">Security</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
