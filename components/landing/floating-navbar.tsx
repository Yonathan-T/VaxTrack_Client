"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "@/lib/user-context"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

export function FloatingNavbar() {
    const { user } = useUser()
    const { language } = useLanguage()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { name: t("nav.home" as any, language) || "Home", href: "#hero" },
        { name: t("nav.features" as any, language) || "Features", href: "#features" },
        { name: t("nav.about" as any, language) || "About", href: "#about" },
        { name: t("nav.faq" as any, language) || "FAQ", href: "#faq" },
    ]

    return (
        <nav
            className={cn(
                "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl transition-all duration-500",
                isScrolled
                    ? "bg-background/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-full py-2 px-6"
                    : "bg-transparent py-4 px-2"
            )}
        >
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Image src="/logo.svg" alt="VaxTrack Logo" width={32} height={32} className="object-contain" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        VaxTrack
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                    {user ? (
                        <Link href="/dashboard">
                            <Button rounded-full="true" className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
                                Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button rounded-full="true" className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
                                Login
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-2">
                    <ThemeSwitcher />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-full"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={cn(
                    "absolute top-full left-0 right-0 mt-4 p-6 bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl transition-all duration-300 origin-top flex flex-col gap-4 md:hidden",
                    mobileMenuOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
                )}
            >
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-semibold py-2 px-4 rounded-xl hover:bg-primary/10 transition-colors"
                    >
                        {link.name}
                    </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <div className="flex items-center justify-between px-4">
                    <span className="font-medium text-muted-foreground">Language</span>
                    <LanguageSwitcher />
                </div>
                {user ? (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full rounded-2xl py-6 text-lg font-bold">Go to Dashboard</Button>
                    </Link>
                ) : (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full rounded-2xl py-6 text-lg font-bold">Login to VaxTrack</Button>
                    </Link>
                )}
            </div>
        </nav>
    )
}
