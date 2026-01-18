"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Shield, ArrowLeft, Mail, AlertCircle, CheckCircle } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPassword } from "@/lib/auth-api"

export default function ForgotPasswordPage() {
    const { language } = useLanguage()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await resetPassword(email)
            setSuccess(true)
        } catch (err: any) {
            console.error("Forgot password error:", err)
            setError(language === "am" ? "ኢሜይል መላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።" : "Failed to send reset email. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background">
            {/* Left Side - Branding */}
            <div className="hidden md:flex md:w-1/2 bg-primary p-12 flex-col justify-between text-primary-foreground relative overflow-hidden">
                <Image
                    src="/images/vaccination-login.webp"
                    alt="Child receiving vaccination"
                    fill
                    priority
                    className="object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-primary/60"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-foreground/20 p-2.5 rounded-lg backdrop-blur-sm">
                            <Shield className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">VaxTrack</h1>
                            <p className="text-sm opacity-90 font-medium">{language === "am" ? "የክትባት ክትትል ስርዓት" : "Vaccination Tracking System"}</p>
                        </div>
                    </div>
                    <LanguageSwitcher />
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold text-balance leading-tight">
                        {language === "am" ? "የይለፍ ቃልዎን መልሰው ያግኙ" : "Recover your account access"}
                    </h2>
                    <p className="mt-4 text-primary-foreground/80 max-w-md text-lg">
                        {language === "am" ? "የይለፍ ቃልዎን ረስተዋል? ችግር የለም። ኢሜይልዎን ያስገቡ እና መልሶ ማግኛ መመሪያዎችን እንልካለን።" : "Forgot your password? No problem. Enter your email and we'll send you recovery instructions."}
                    </p>
                </div>

                <div className="relative z-10 text-sm opacity-80 font-medium">
                    {language === "am" ? "ኢትዮጵያን እናገለግላለን" : "Serving Ethiopia"}
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
                <div className="w-full max-w-md">
                    <div className="md:hidden mb-10 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    <Shield className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-foreground">VaxTrack</h1>
                                </div>
                            </div>
                            <LanguageSwitcher />
                        </div>
                    </div>

                    <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {language === "am" ? "ወደ መግቢያ ተመለስ" : "Back to login"}
                    </Link>

                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-foreground tracking-tight">
                            {language === "am" ? "ይለፍ ቃል ይርሱ" : "Forgot Password"}
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            {language === "am" ? "ከመለያዎ ጋር የተያያዘውን ኢሜይል ያስገቡ።" : "Enter the email associated with your account."}
                        </p>
                    </div>

                    {success ? (
                        <div className="space-y-6">
                            <Alert className="bg-green-50 border-green-200">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700 ml-2">
                                    {language === "am"
                                        ? "የይለፍ ቃል መልሶ ማግኛ ኢሜይል ተልኳል። እባክዎ የገቢ መልዕክት ሳጥንዎን ይመልከቱ።"
                                        : "Password reset email sent! Please check your inbox."}
                                </AlertDescription>
                            </Alert>
                            <Button asChild className="w-full h-11">
                                <Link href="/login">
                                    {language === "am" ? "ወደ መግቢያ ተመለስ" : "Back to Login"}
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="ml-2">{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                                    {language === "am" ? "ኢሜይል" : "Email"}
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-11 bg-input border-border focus:border-primary transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-11 font-semibold text-base mt-2" disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                        {language === "am" ? "በመላክ ላይ..." : "Sending..."}
                                    </div>
                                ) : language === "am" ? (
                                    "መመሪያዎችን ላክ"
                                ) : (
                                    "Send Instructions"
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
