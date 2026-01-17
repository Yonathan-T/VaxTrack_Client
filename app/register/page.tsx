"use client"

import Link from "next/link"
import Image from "next/image"
import { RegisterForm } from "@/components/auth/register-form"
import { Shield } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export default function RegisterPage() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Side - Branding with Image */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-secondary via-secondary to-secondary/90 p-12 flex-col justify-between text-secondary-foreground relative overflow-hidden">
        <Image
          src="/images/vaccination-register.png"
          alt="Child receiving vaccination with healthcare worker"
          fill
          className="object-cover absolute inset-0"
          priority
        />
        <div className="absolute inset-0 bg-secondary/40"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-secondary-foreground/20 p-2.5 rounded-lg backdrop-blur-sm">
              <Shield className="h-7 w-7 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">VaxTrack</h1>
              <p className="text-sm opacity-90 font-medium">{t("register.location", language)}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-bold text-balance leading-tight">{t("register.title", language)}</h2>
        </div>

        <div className="relative z-10 text-sm opacity-80 font-medium">{t("register.trusted", language)}</div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-secondary/10 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">VaxTrack</h1>
                  <p className="text-xs text-muted-foreground">{t("register.location", language)}</p>
                </div>
              </div>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {t("register.create", language)}
            </h2>
          </div>

          <div className="mb-8">
            <RegisterForm />
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              {t("register.haveAccount", language)}{" "}
              <Link href="/login" className="font-semibold text-secondary hover:text-secondary/80 transition-colors">
                {t("register.signIn", language)}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
