"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/user-context"
import { createCampaign, getFacilities, type Facility } from "@/lib/official-api"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

interface CreateCampaignModalProps {
    children: React.ReactNode
    onCampaignCreated: () => void
}

export function CreateCampaignModal({ children, onCampaignCreated }: CreateCampaignModalProps) {
    const { language } = useLanguage()
    const { toast } = useToast()
    const { user } = useUser()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [vaccines, setVaccines] = useState<VaccineDefinition[]>([])
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [isLoadingVaccines, setIsLoadingVaccines] = useState(false)
    const [isLoadingFacilities, setIsLoadingFacilities] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        target_region: "",
        start_date: "",
        end_date: "",
        target_vaccine_code: "", // Changed from target_vaccine to target_vaccine_code
        target_population: "",
        target_age_group: "",
        facility_ids: [] as number[],
    })

    useEffect(() => {
        if (open) {
            async function loadData() {
                // Load vaccines from vaccine definitions
                setIsLoadingVaccines(true)
                try {
                    const res = await getVaccines()
                    const responseData = res.data as any
                    
                    // Handle different response structures
                    const vaccinesList = Array.isArray(responseData)
                        ? responseData
                        : responseData?.data && Array.isArray(responseData.data)
                            ? responseData.data
                            : [];
                    
                    setVaccines(vaccinesList)
                } catch (err) {
                    console.error("Failed to load vaccines:", err)
                    toast({
                        title: language === "am" ? "ስህተት" : "Error",
                        description: language === "am" ? "ቫይረሶችን መጫን አልተቻለም" : "Failed to load vaccines",
                        variant: "destructive",
                    })
                } finally {
                    setIsLoadingVaccines(false)
                }

                // Load facilities for health officials
                if (user?.role === "health_official") {
                    setIsLoadingFacilities(true)
                    try {
                        console.log("[CreateCampaignModal] Starting facilities load for user:", user)
                        const res = await getFacilities()
                        console.log("[CreateCampaignModal] Raw API response:", res)
                        console.log("[CreateCampaignModal] Response status:", res.status)
                        console.log("[CreateCampaignModal] Response data:", res.data)
                        
                        // Handle the actual API response structure
                        let facilitiesList: Facility[] = []
                        if (res.data?.success && res.data?.data) {
                            facilitiesList = res.data.data
                            console.log("[CreateCampaignModal] Using res.data.data structure")
                        } else if (Array.isArray(res.data)) {
                            facilitiesList = res.data
                            console.log("[CreateCampaignModal] Using res.data as array")
                        } else if (res.data?.data && Array.isArray(res.data.data)) {
                            facilitiesList = res.data.data
                            console.log("[CreateCampaignModal] Using res.data.data as array")
                        } else {
                            console.log("[CreateCampaignModal] Unknown response structure:", res.data)
                        }
                        
                        console.log("[CreateCampaignModal] Parsed facilities list:", facilitiesList)
                        console.log("[CreateCampaignModal] Facilities list length:", facilitiesList.length)
                        console.log("[CreateCampaignModal] Full user object:", user)
                        console.log("[CreateCampaignModal] User sub_city_id:", user.sub_city_id)
                        console.log("[CreateCampaignModal] User sub_city_id type:", typeof user.sub_city_id)
                        
                        // Since API is role-aware, use all facilities returned (they're already filtered)
                        console.log("[CreateCampaignModal] API is role-aware, using all returned facilities")
                        setFacilities(facilitiesList)
                        
                    } catch (err: any) {
                        console.error("Failed to load facilities:", err)
                        console.error("Error details:", err.response?.data || err.message)
                        toast({
                            title: language === "am" ? "ስህተት" : "Error",
                            description: language === "am" ? "ክሊኒኮችን መጫን አልተቻለም" : "Failed to load facilities",
                            variant: "destructive",
                        })
                    } finally {
                        setIsLoadingFacilities(false)
                    }
                } else {
                    console.log("[CreateCampaignModal] User is not health_official, role:", user?.role)
                }
            }
            loadData()
        } else {
            // Reset form when modal closes
            setFormData({
                title: "",
                description: "",
                target_region: "",
                start_date: "",
                end_date: "",
                target_vaccine_code: "",
                target_population: "",
                target_age_group: "",
                facility_ids: [],
            })
            setFacilities([])
            setVaccines([])
        }
    }, [open, user, language])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            // Prepare payload according to API spec
            const payload = {
                title: formData.title,
                description: formData.description,
                target_vaccine_code: formData.target_vaccine_code,
                target_population: parseInt(formData.target_population),
                target_age_group: formData.target_age_group,
                start_date: formData.start_date,
                end_date: formData.end_date,
                facility_ids: formData.facility_ids.length > 0 ? formData.facility_ids : undefined,
                // target_region will be set by backend to official's sub-city name if not provided
                ...(formData.target_region && { target_region: formData.target_region })
            }

            const res = await createCampaign(payload)
            console.log("[CreateCampaignModal] Campaign creation response:", res)
            console.log("[CreateCampaignModal] Response data:", res.data)
            console.log("[CreateCampaignModal] Response status:", res.status)
            console.log("[CreateCampaignModal] Response data keys:", res.data ? Object.keys(res.data) : 'undefined')
            console.log("[CreateCampaignModal] Response data success:", res.data?.success)
            
            if (res.status === 201 || res.status === 200) {
                // For 201/200, consider it successful regardless of success flag
                console.log("[CreateCampaignModal] Campaign created successfully (status:", res.status, ")")
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
                    target_population: "",
                    target_age_group: "",
                    facility_ids: [],
                })
            } else if (res.status === 422) {
                console.log("[CreateCampaignModal] Validation error:", res.error)
                console.log("[CreateCampaignModal] Full error object:", JSON.stringify(res.error, null, 2))
                const errorMessage = (res.error as any)?.message || (res.error as any)?.details || JSON.stringify(res.error) || "Validation failed"
                throw new Error(errorMessage)
            } else {
                console.log("[CreateCampaignModal] Campaign creation failed, res.data:", res.data)
                throw new Error(res.data?.message || "Failed to create campaign")
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

    const handleFacilityToggle = (facilityId: number, checked: boolean) => {
        if (checked) {
            setFormData(prev => ({
                ...prev,
                facility_ids: [...prev.facility_ids, facilityId]
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                facility_ids: prev.facility_ids.filter(id => id !== facilityId)
            }))
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{language === "am" ? "አዲስ ዘመቻ ፍጠር" : "Create New Campaign"}</DialogTitle>
                        <DialogDescription className="bg-transparent">
                            {language === "am" ? "ለክትባት ዘመቻ የሚያስፈልጉ ዝርዝሮችን ያስገቡ" : "Enter the details for the vaccination campaign"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">{language === "am" ? "ርዕስ" : "Title"} *</Label>
                            <Input
                                id="title"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder={language === "am" ? "የዘመቻው ርዕስ" : "Campaign title"}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">{language === "am" ? "መግለጫ" : "Description"} *</Label>
                            <Textarea
                                id="description"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={language === "am" ? "የዘመቻው ዝርዝር መግለጫ" : "Detailed description of the campaign"}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="target_region">{language === "am" ? "ክልል/ቦታ" : "Target Region"} ({language === "am" ? "አማራጭ" : "Optional"})</Label>
                                <Input
                                    id="target_region"
                                    value={formData.target_region}
                                    onChange={(e) => setFormData({ ...formData, target_region: e.target.value })}
                                    placeholder={language === "am" ? "ለምሳሌ፡ ቦሌ" : "e.g. Bole"}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {language === "am" ? "ካልተሟላ የኦፊሴላው ከተማ ስም ይጠቀማል" : "Defaults to official's sub-city if not provided"}
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="target_vaccine_code">{language === "am" ? "የቫይረስ ኮድ" : "Vaccine Code"} *</Label>
                                <Select
                                    onValueChange={(val) => setFormData({ ...formData, target_vaccine_code: val })}
                                    value={formData.target_vaccine_code}
                                >
                                    <SelectTrigger id="target_vaccine_code">
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
                                                {language === "am" ? "ምንም ቫይረስ አልተገኘም" : "No vaccines found"}
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
                                <p className="text-xs text-muted-foreground">
                                    {language === "am" ? "ከእቃዎች ዝርዝር ያለምረጡ" : "Select from available vaccines in inventory"}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="target_population">{language === "am" ? "የኢሰባተኛ ብዛት" : "Target Population"} *</Label>
                                <Input
                                    id="target_population"
                                    type="number"
                                    required
                                    value={formData.target_population}
                                    onChange={(e) => setFormData({ ...formData, target_population: e.target.value })}
                                    placeholder={language === "am" ? "ለምሳሌ፡ 30000" : "e.g. 30000"}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="target_age_group">{language === "am" ? "የዕድሜ ቡድን" : "Target Age Group"} *</Label>
                                <Input
                                    id="target_age_group"
                                    required
                                    value={formData.target_age_group}
                                    onChange={(e) => setFormData({ ...formData, target_age_group: e.target.value })}
                                    placeholder={language === "am" ? "ለምሳሌ፡ 9-59 ወሮች" : "e.g. 9-59 Months"}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">{language === "am" ? "መጀመሪያ ቀን" : "Start Date"} *</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">{language === "am" ? "መጨረሻ ቀን" : "End Date"} *</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    required
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                        
                        {/* Facility Selection for Health Officials */}
                        {user?.role === "health_official" && (
                            <div className="grid gap-2">
                                <Label>{language === "am" ? "ክሊኒኮች" : "Facilities"} *</Label>
                                {isLoadingFacilities ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span className="text-sm text-muted-foreground">
                                            {language === "am" ? "ክሊኒኮችን በመጫን ላይ..." : "Loading facilities..."}
                                        </span>
                                    </div>
                                ) : facilities.length === 0 ? (
                                    <div className="p-4 text-sm text-center text-muted-foreground italic">
                                        {language === "am" ? "ምንም ክሊኒክ አልተገኘም" : "No facilities found"}
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                                        {facilities.map((facility) => (
                                            <div key={facility.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`facility-${facility.id}`}
                                                    checked={formData.facility_ids.includes(Number(facility.id))}
                                                    onCheckedChange={(checked) => handleFacilityToggle(Number(facility.id), checked as boolean)}
                                                />
                                                <Label 
                                                    htmlFor={`facility-${facility.id}`}
                                                    className="text-sm cursor-pointer flex-1"
                                                >
                                                    {facility.name} - {facility.location}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {language === "am" ? "ከኦፊሴላው ከተማ ጋር የሚገኙትን ክሊኒኮች ይምረጡ" : "Select facilities in your sub-city"}
                                </p>
                            </div>
                        )}
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
