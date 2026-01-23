"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { createCampaign } from "@/lib/official-api"
import { getVaccines, type VaccineDefinition } from "@/lib/admin-api"
import { inventoryApi } from "@/lib/inventory-api"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface CreateCampaignModalProps {
    children: React.ReactNode
    onCampaignCreated: () => void
}

export function CreateCampaignModal({ children, onCampaignCreated }: CreateCampaignModalProps) {
    const { language } = useLanguage()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [vaccines, setVaccines] = useState<VaccineDefinition[]>([])
    const [isLoadingVaccines, setIsLoadingVaccines] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        target_region: "",
        start_date: "",
        end_date: "",
        target_vaccine_code: "",
    })

    useEffect(() => {
        if (open) {
            async function loadVaccines() {
                setIsLoadingVaccines(true)
                try {
                    const res = await inventoryApi.list()
                    const responseData = res.data as any

                    // Defensive check for different response structures
                    const rawItems = Array.isArray(responseData)
                        ? responseData
                        : responseData?.data && Array.isArray(responseData.data)
                            ? responseData.data
                            : [];

                    // Extract unique vaccines from inventory items
                    const uniqueMap = new Map()
                    rawItems.forEach((item: any) => {
                        const v = item.vaccine
                        if (v && v.code && !uniqueMap.has(v.code)) {
                            uniqueMap.set(v.code, {
                                id: v.id,
                                name: v.name,
                                code: v.code
                            })
                        }
                    })

                    setVaccines(Array.from(uniqueMap.values()))
                } catch (err) {
                    console.error("Failed to load inventory vaccines:", err)
                    toast({
                        title: language === "am" ? "ስህተት" : "Error",
                        description: language === "am" ? "ክትባቶችን መጫን አልተቻለም" : "Failed to load vaccines",
                        variant: "destructive",
                    })
                } finally {
                    setIsLoadingVaccines(false)
                }
            }
            loadVaccines()
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await createCampaign(formData)
            if (res.data.success) {
                toast({
                    title: language === "am" ? "ተሳክቷል" : "Success",
                    description: language === "am" ? "ዘመቻው በተሳካ ሁኔታ ተፈጥሯል" : "Campaign created successfully",
                })
                setOpen(false)
                onCampaignCreated()
                setFormData({
                    title: "",
                    description: "",
                    target_region: "",
                    start_date: "",
                    end_date: "",
                    target_vaccine_code: "",
                })
            } else {
                throw new Error(res.data.message || "Failed to create campaign")
            }
        } catch (err: any) {
            console.error("Failed to create campaign:", err)
            toast({
                title: language === "am" ? "ስህተት" : "Error",
                description: err.response?.data?.message || err.message || (language === "am" ? "ዘመቻ መፍጠር አልተቻለም" : "Failed to create campaign"),
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{language === "am" ? "አዲስ ዘመቻ ፍጠር" : "Create New Campaign"}</DialogTitle>
                        <DialogDescription className="bg-transparent">
                            {language === "am" ? "ለክትባት ዘመቻ የሚያስፈልጉ ዝርዝሮችን ያስገቡ" : "Enter the details for the vaccination campaign"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">{language === "am" ? "ርዕስ" : "Title"}</Label>
                            <Input
                                id="title"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder={language === "am" ? "የዘመቻው ርዕስ" : "Campaign title"}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">{language === "am" ? "መግለጫ" : "Description"} ({language === "am" ? "አማራጭ" : "Optional"})</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={language === "am" ? "የዘመቻው ዝርዝር መግለጫ" : "Detailed description of the campaign"}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="target_region">{language === "am" ? "ክልል/ቦታ" : "Target Region"}</Label>
                                <Input
                                    id="target_region"
                                    required
                                    value={formData.target_region}
                                    onChange={(e) => setFormData({ ...formData, target_region: e.target.value })}
                                    placeholder={language === "am" ? "ለምሳሌ፡ ቦሌ" : "e.g. Bole"}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="vaccine">{language === "am" ? "ክትባት" : "Vaccine"}</Label>
                                <Select
                                    onValueChange={(val) => setFormData({ ...formData, target_vaccine_code: val })}
                                    value={formData.target_vaccine_code}
                                >
                                    <SelectTrigger id="vaccine">
                                        <SelectValue placeholder={language === "am" ? "ይምረጡ" : "Select vaccine"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingVaccines ? (
                                            <div className="flex items-center justify-center p-4">
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                <span className="text-sm text-muted-foreground">
                                                    {language === "am" ? "በመጫን ላይ..." : "Loading..."}
                                                </span>
                                            </div>
                                        ) : vaccines.length === 0 ? (
                                            <div className="p-4 text-sm text-center text-muted-foreground italic">
                                                {language === "am" ? "ምንም ክትባት አልተገኘም" : "No vaccines found"}
                                            </div>
                                        ) : (
                                            vaccines.map((v: any) => (
                                                <SelectItem key={v.id} value={v.code || v.abbreviation}>
                                                    {v.name} ({v.code || v.abbreviation})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">{language === "am" ? "መጀመሪያ ቀን" : "Start Date"}</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">{language === "am" ? "መጨረሻ ቀን" : "End Date"}</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    required
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            {language === "am" ? "ሰርዝ" : "Cancel"}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {language === "am" ? "ፍጠር" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
