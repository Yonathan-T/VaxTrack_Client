"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Loader2, Save, AlertCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { changePassword } from "@/lib/auth-api"
import { useToast } from "@/hooks/use-toast"

export function ChangePasswordSettings() {
    const { language } = useLanguage()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        old_password: "",
        password: "",
        password_confirmation: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Submitting password change...", formData)

        // Client-side validation
        if (formData.password !== formData.password_confirmation) {
            console.log("Validation failed: Passwords do not match")
            toast({
                title: language === "am" ? "ስህተት" : "Error",
                description: language === "am" ? "አዲሱ የይለፍ ቃል እና ማረጋገጫው አይዛመዱም" : "Passwords do not match",
                variant: "destructive",
            })
            return
        }

        if (formData.password.length < 8) {
            console.log("Validation failed: Password too short")
            toast({
                title: language === "am" ? "ስህተት" : "Error",
                description: language === "am" ? "የይለፍ ቃሉ ቢያንስ 8 ገጸ-ባህሪያት መሆን አለበት" : "Password must be at least 8 characters",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const { error } = await changePassword(formData)
            console.log("API response error:", error)

            if (error) {
                toast({
                    title: language === "am" ? "ስህተት" : "Error",
                    description: error.message || (language === "am" ? "የይለፍ ቃል መቀየር አልተቻለም" : "Failed to change password"),
                    variant: "destructive",
                })
            } else {
                toast({
                    title: language === "am" ? "ተሳክቷል" : "Success",
                    description: language === "am" ? "የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል" : "Password changed successfully",
                })
                // Clear form
                setFormData({
                    old_password: "",
                    password: "",
                    password_confirmation: "",
                })
            }
        } catch (err) {
            console.error("Password change error:", err)
            toast({
                title: language === "am" ? "ስህተት" : "Error",
                description: language === "am" ? "የተጠፋ ነገር አለ" : "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
                {language === "am" ? "የይለፍ ቃል ይቀይሩ" : "Change Password"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="old_password">
                        <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            {language === "am" ? "የድሮ የይለፍ ቃል" : "Current Password"}
                        </div>
                    </Label>
                    <Input
                        id="old_password"
                        type="password"
                        value={formData.old_password}
                        onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                        placeholder={language === "am" ? "የድሮ የይለፍ ቃልዎን ያስገቡ" : "Enter your current password"}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">
                        <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            {language === "am" ? "አዲስ የይለፍ ቃል" : "New Password"}
                        </div>
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={language === "am" ? "አዳዲስ የይለፍ ቃል ያስገቡ" : "Enter your new password"}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">
                        <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            {language === "am" ? "አዲስ የይለፍ ቃል ያረጋግጡ" : "Confirm New Password"}
                        </div>
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                        placeholder={language === "am" ? "አዳዲስ የይለፍ ቃልዎን ያረጋግጡ" : "Confirm your new password"}
                        required
                    />
                </div>

                <div className="pt-4 border-t">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {language === "am" ? "በመቀየር ላይ..." : "Changing..."}
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {language === "am" ? "የይለፍ ቃል ቀይር" : "Change Password"}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    )
}
