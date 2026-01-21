"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, User as UserIcon, Save, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useUser, type User } from "@/lib/user-context"
import { updateProfile } from "@/lib/parent-api"
import { useToast } from "@/hooks/use-toast"

export function UserProfileSettings() {
    const { language } = useLanguage()
    const { user, setUser } = useUser()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: (user as any)?.phone || "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { data, error } = await updateProfile(formData)

            if (error) {
                toast({
                    title: language === "am" ? "ስህተት" : "Error",
                    description: error.message || (language === "am" ? "መግለጫው ማሻሻል አልተቻለም" : "Failed to update profile"),
                    variant: "destructive",
                })
            } else if (data && user) {
                // Update user context with new data
                setUser({ ...user, ...data } as User)

                toast({
                    title: language === "am" ? "ተሳክቷል" : "Success",
                    description: language === "am" ? "መግለጫው በተሳካ ሁኔታ ተስተካክሏል" : "Profile updated successfully",
                })
            }
        } catch (err) {
            console.error("Profile update error:", err)
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
                {language === "am" ? "የግል መረጃ" : "Profile Information"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            {language === "am" ? "ሙሉ ስም" : "Full Name"}
                        </div>
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={language === "am" ? "ስምዎን ያስገቡ" : "Enter your full name"}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {language === "am" ? "ኢሜይል" : "Email Address"}
                        </div>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={language === "am" ? "ኢሜይልዎን ያስገቡ" : "Enter your email"}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {language === "am" ? "ስልክ ቁጥር" : "Phone Number"}
                        </div>
                    </Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={language === "am" ? "ስልክ ቁጥርዎን ያስገቡ" : "Enter your phone number"}
                    />
                </div>

                <div className="pt-4 border-t">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {language === "am" ? "በማስቀመጥ ላይ..." : "Saving..."}
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {language === "am" ? "ለውጦችን አስቀምጥ" : "Save Changes"}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    )
}
