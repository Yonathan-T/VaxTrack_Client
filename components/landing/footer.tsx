"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
    const { language } = useLanguage()

    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-card border-t border-border pt-16 pb-8 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                {/* Brand Column */}
                <div className="space-y-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image src="/logo.svg" alt="VaxTrack Logo" width={32} height={32} />
                        <span className="text-2xl font-bold text-foreground">VaxTrack</span>
                    </Link>
                    <p className="text-muted-foreground leading-relaxed">
                        {t("landing.footer.description" as any, language)}
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                            <Facebook className="h-5 w-5" />
                        </a>
                        <a href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                            <Twitter className="h-5 w-5" />
                        </a>
                        <a href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                            <Instagram className="h-5 w-5" />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-bold text-lg mb-6">{t("landing.footer.platformTitle" as any, language)}</h4>
                    <ul className="space-y-4">
                        <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">{t("nav.features" as any, language)}</Link></li>
                        <li><Link href="#about" className="text-muted-foreground hover:text-primary transition-colors">{t("nav.about" as any, language)}</Link></li>
                        <li><Link href="#faq" className="text-muted-foreground hover:text-primary transition-colors">{t("nav.faq" as any, language)}</Link></li>
                        <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">{t("landing.footer.linkLogin" as any, language)}</Link></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="font-bold text-lg mb-6">{t("landing.footer.supportTitle" as any, language)}</h4>
                    <ul className="space-y-4">
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("landing.footer.linkPrivacy" as any, language)}</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("landing.footer.linkTerms" as any, language)}</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("landing.footer.linkHelp" as any, language)}</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("landing.footer.linkContact" as any, language)}</a></li>
                    </ul>
                </div>

                {/* Contact info */}
                <div>
                    <h4 className="font-bold text-lg mb-6">{t("landing.footer.contactTitle" as any, language)}</h4>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{t("landing.footer.address" as any, language)}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-primary shrink-0" />
                            <span className="text-muted-foreground">+251 11 123 4567</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-primary shrink-0" />
                            <span className="text-muted-foreground">contact@vaxtrack.et</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-border/50 text-center flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">
                    © {currentYear} VaxTrack. {t("landing.footer.allRights" as any, language)}
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t("landing.footer.tagline" as any, language)}</span>
                </div>
            </div>
        </footer>
    )
}
