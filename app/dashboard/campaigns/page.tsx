"use client"

import { useEffect, useState, useCallback } from "react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { t } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
import { RoleProtected } from "@/lib/role-protected"
import { getCampaigns, type Campaign, updateCampaign, deleteCampaign } from "@/lib/official-api"
import { Button } from "@/components/ui/button"
import { Plus, Search, Calendar, MapPin, Tag, RefreshCcw, LayoutGrid, List, CheckCircle, XCircle, Trash2, MoreVertical, Activity, Clock, PauseCircle, Users, Baby, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateCampaignModal } from "@/components/campaigns/create-campaign-modal"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CampaignsPage() {
    const { language } = useLanguage()
    const { user } = useUser()
    const { toast } = useToast()
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchCampaigns = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true)
        else setIsRefreshing(true)

        try {
            let res
            
            // Use different endpoint for nurses
            if (user?.role === "healthcare_worker") {
                // Use nurse-specific endpoint - it works in Postman!
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vaxtrackapi.onrender.com'
                const token = localStorage.getItem('authToken')
                
                const nurseUrl = `${baseUrl}/v1/official/nurse/campaigns`
                console.log("[CampaignsPage] Fetching nurse campaigns from:", nurseUrl)
                console.log("[CampaignsPage] Token exists:", !!token)
                console.log("[CampaignsPage] Token length:", token?.length || 0)
                console.log("[CampaignsPage] User role:", user?.role)
                console.log("[CampaignsPage] User facility:", user?.facility)
                console.log("[CampaignsPage] User facility_id:", user?.facility_id)
                
                const response = await fetch(nurseUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                
                console.log("[CampaignsPage] Nurse API response status:", response.status)
                console.log("[CampaignsPage] Nurse API response ok:", response.ok)
                console.log("[CampaignsPage] Nurse API response headers:", [...response.headers.entries()])
                
                if (!response.ok) {
                    const errorText = await response.text()
                    console.log("[CampaignsPage] Nurse API error response:", errorText)
                    throw new Error(`Failed to fetch nurse campaigns: ${response.status}`)
                }
                
                const data = await response.json()
                res = { data }
                console.log("[CampaignsPage] Nurse API response data:", data)
            } else {
                // Use regular endpoint for other roles
                res = await getCampaigns()
                console.log("[CampaignsPage] Regular API response:", res)
            }
            
            // Handle different response structures
            if (res.data) {
                const responseData = res.data as any
                
                // Check for various possible response structures
                let campaignList = []
                
                if (user?.role === "healthcare_worker") {
                    // Nurse endpoint returns: {success: true, data: [...]}
                    if (responseData.success === true && Array.isArray(responseData.data)) {
                        campaignList = responseData.data
                        console.log("[CampaignsPage] Nurse campaigns parsed directly:", campaignList)
                    } else if (Array.isArray(responseData.data)) {
                        campaignList = responseData.data
                    } else if (Array.isArray(responseData)) {
                        campaignList = responseData
                    }
                } else {
                    // Regular endpoint parsing
                    if (responseData.success === true && responseData.data) {
                        // Laravel pagination: { success: true, data: { data: [...], current_page, ... } }
                        campaignList = responseData.data.data || []
                    } else if (responseData.data) {
                        // Direct data: { data: [...] } or { data: { data: [...] } }
                        campaignList = responseData.data.data || responseData.data || []
                    } else if (Array.isArray(responseData)) {
                        // Direct array response
                        campaignList = responseData
                    } else if (Array.isArray(res.data)) {
                        // Array directly in response.data
                        campaignList = res.data
                    }
                }
                
                console.log("[CampaignsPage] Final campaign list:", campaignList)
                setCampaigns(Array.isArray(campaignList) ? campaignList : [])
            } else {
                // No data in response, set empty array
                console.log("[CampaignsPage] No data in response, setting empty array")
                setCampaigns([])
            }
        } catch (err: any) {
            console.error("Campaign fetch error details:", err)
            console.error("Error response:", err.response)
            
            // Don't show error toast for network errors that might be temporary
            if (err.response?.status !== 401 && err.response?.status !== 403) {
                toast({
                    title: language === "am" ? "ስህተት" : "Error",
                    description: language === "am" ? "ዘመቻዎችን መጫን አልተቻለም" : "Failed to load campaigns",
                    variant: "destructive",
                })
            }
            
            // Set empty array on error to prevent infinite loading
            setCampaigns([])
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [language, toast])

    useEffect(() => {
        fetchCampaigns()
    }, [fetchCampaigns])

    const filteredCampaigns = campaigns.filter(c => {
        const title = c.title?.toLowerCase() || ""
        const region = c.target_region?.toLowerCase() || ""
        const vaccineCode = (c.target_vaccine_code || (c as any).vaccine_code || (c as any).targetVaccineCode || (c as any).vaccine?.code || "")?.toLowerCase()
        const query = searchQuery.toLowerCase()

        return title.includes(query) || region.includes(query) || vaccineCode.includes(query)
    })

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: language === "am" ? "ንቁ" : "Active", variant: "default" as const, icon: Activity },
            completed: { label: language === "am" ? "አጠናቅ" : "Completed", variant: "secondary" as const, icon: CheckCircle },
            cancelled: { label: language === "am" ? "ተሰርዘ" : "Cancelled", variant: "destructive" as const, icon: XCircle },
            planned: { label: language === "am" ? "ተቀጥሯል" : "Planned", variant: "outline" as const, icon: Clock },
            paused: { label: language === "am" ? "ቆሟል" : "Paused", variant: "secondary" as const, icon: PauseCircle },
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planned
        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <config.icon className="h-3 w-3" />
                {config.label}
            </Badge>
        )
    }

    const getVaccineName = (vaccineCode: string | undefined) => {
        if (!vaccineCode) return language === "am" ? "ያልታወቀ" : "Unknown"
        
        // Map common vaccine codes to names
        const vaccineNames: Record<string, string> = {
            "BCG": language === "am" ? "ቢሲጂ" : "BCG Vaccine",
            "OPV": language === "am" ? "ኦፒቪ" : "Oral Polio Vaccine", 
            "MCV-1": language === "am" ? "ኤምሲቪ-1" : "Measles Vaccine 1",
            "MCV-2": language === "am" ? "ኤምሲቪ-2" : "Measles Vaccine 2",
            "PENTA": language === "am" ? "ፔንታ" : "Pentavalent Vaccine",
            "DPT": language === "am" ? "ዲፒቲ" : "DPT Vaccine",
            "HepB": language === "am" ? "ሄፕ ቢ" : "Hepatitis B",
            "Hib": language === "am" ? "ሃይብ" : "H. influenzae type b",
            "PCV": language === "am" ? "ፒሲቪ" : "Pneumococcal Vaccine",
            "ROTA": language === "am" ? "ሮታ" : "Rotavirus Vaccine",
            "IPV": language === "am" ? "አይፒቪ" : "Inactivated Polio Vaccine",
            "TT": language === "am" ? "ቲቲ" : "Tetanus Toxoid",
            "COVID-19": language === "am" ? "ኮቪድ-19" : "COVID-19 Vaccine"
        }
        
        return vaccineNames[vaccineCode] || vaccineCode
    }

    const getLocationDisplay = (campaign: any) => {
        const region = campaign.target_region
        const ageGroup = campaign.target_age_group
        const population = campaign.target_population
        
        const lines = []
        
        // Location line
        if (region) {
            lines.push(
                <div key="location" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{region}</span>
                </div>
            )
        }
        
        // Age group line
        if (ageGroup) {
            lines.push(
                <div key="age" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Baby className="h-3.5 w-3.5 text-blue-500" />
                    <span>{ageGroup}</span>
                </div>
            )
        }
        
        // Population line
        if (population) {
            lines.push(
                <div key="population" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5 text-green-500" />
                    <span>{population.toLocaleString()} {language === "am" ? "ሰዎች" : "people"}</span>
                </div>
            )
        }
        
        return <div className="space-y-1.5">{lines}</div>
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const res = await updateCampaign(id, { status })
            if (res.data && (res.data as any).success) {
                toast({
                    title: language === "am" ? "ተሳክቷል" : "Success",
                    description: language === "am" ? "ዘመቻው በተሳካ ሁኔታ ተሰርዟል" : "Campaign deleted successfully",
                })
                fetchCampaigns(true)
            }
        } catch (err: any) {
            toast({
                title: language === "am" ? "ስህተት" : "Error",
                description: err.message || "Failed to update status",
                variant: "destructive",
            })
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const res = await deleteCampaign(id)
            if (res.data && (res.data as any).success) {
                toast({
                    title: language === "am" ? "ተሳክቷል" : "Success",
                    description: language === "am" ? "ዘመቻው በተሳካ ሁኔታ ተሰርዟል" : "Campaign deleted successfully",
                })
                fetchCampaigns(true)
            }
        } catch (err: any) {
            toast({
                title: language === "am" ? "ስህተት" : "Error",
                description: err.message || "Failed to delete campaign",
                variant: "destructive",
            })
        }
    }

    return (
        <RoleProtected allowedRoles={["healthcare_worker", "admin", "system_administrator", "health_official", "woreda_officer"]}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {language === "am" ? "የክትባት ዘመቻዎች" : "Vaccination Campaigns"}
                        </h1>
                        <p className="text-muted-foreground">
                            {language === "am" ? "የታቀዱ እና ንቁ የክትባት ዘመቻዎችን ያስተዳድሩ" : "Manage planned and active vaccination campaigns"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => fetchCampaigns(true)}
                            disabled={isRefreshing}
                            title={language === "am" ? "አድስ" : "Refresh"}
                        >
                            <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                        </Button>
                        <div className="flex border rounded-md overflow-hidden">
                            <Button
                                variant={viewMode === "grid" ? "secondary" : "ghost"}
                                size="icon"
                                className="rounded-none"
                                onClick={() => setViewMode("grid")}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "secondary" : "ghost"}
                                size="icon"
                                className="rounded-none"
                                onClick={() => setViewMode("list")}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                        {/* Only show Create Campaign button for non-nurse roles */}
                        {user?.role !== "healthcare_worker" && (
                            <CreateCampaignModal onCampaignCreated={() => fetchCampaigns(true)}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {language === "am" ? "ახალი ዘመቻ" : "New Campaign"}
                                </Button>
                            </CreateCampaignModal>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={language === "am" ? "ዘመቻዎችን ይፈልጉ..." : "Search campaigns..."}
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2 mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <CardTitle>{language === "am" ? "ምንም ዘመቻ አልተገኘም" : "No campaigns found"}</CardTitle>
                        <CardDescription className="bg-transparent">
                            {searchQuery ?
                                (language === "am" ? "ለፍለጋዎ የሚሆን ዘመቻ የለም" : "No campaigns match your search query") :
                                (language === "am" ? "ገና ምንም ዘመቻ አልተፈጠረም" : "No campaigns have been created yet")}
                        </CardDescription>
                    </Card>
                ) : viewMode === "grid" ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCampaigns.map((campaign, index) => (
                            <Card
                                key={campaign.id}
                                className={cn(
                                    "overflow-hidden flex flex-col relative group cursor-pointer",
                                    "transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] border border-border/50",
                                    "animate-in fade-in slide-in-from-bottom-4 duration-500"
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <CardHeader className="pb-3 px-4 pt-4 relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-1">
                                            {getStatusBadge(campaign.status)}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                                        <MoreVertical className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuLabel>{language === "am" ? "ሁኔታ ቀይር" : "Change Status"}</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(campaign.id, "active")}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                                                        <span>{language === "am" ? "ንቁ አድርግ" : "Mark as Active"}</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(campaign.id, "completed")}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                                                        <span>{language === "am" ? "አጠናቅ" : "Mark as Completed"}</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(campaign.id, "cancelled")}>
                                                        <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                                        <span>{language === "am" ? "ሰርዝ" : "Mark as Cancelled"}</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <div className="flex items-center px-2 py-1.5 text-sm text-destructive cursor-pointer hover:bg-destructive/10 rounded-sm">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>{language === "am" ? "ዘመቻውን ሰርዝ" : "Delete Campaign"}</span>
                                                            </div>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{language === "am" ? "እርግጠኛ ነዎት?" : "Are you sure?"}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {language === "am"
                                                                        ? "ይህ ተግባር ሊመለስ አይችልም። ዘመቻውን ሙሉ በሙሉ ከስርዓቱ ይሰርዘዋል።"
                                                                        : "This action cannot be undone. This will permanently delete the campaign from the system."}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{language === "am" ? "ተመለስ" : "Cancel"}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(campaign.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                    {language === "am" ? "አዎ ሰርዝ" : "Yes, delete"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            {getVaccineName(campaign.target_vaccine_code || (campaign as any).vaccine_code || (campaign as any).targetVaccineCode || (campaign as any).vaccine?.code)}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl leading-tight">{campaign.title}</CardTitle>
                                    <CardDescription className="mt-2 bg-transparent">
                                        {getLocationDisplay(campaign)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="py-2 text-sm text-muted-foreground flex-grow px-3">
                                    <p className="line-clamp-3">{(campaign.description || (campaign as any).desc || (campaign as any).details) || (language === "am" ? "ምንም መግለጫ የለም" : "No description provided")}</p>
                                </CardContent>
                                <CardFooter className="pt-3 border-t bg-muted/30 flex flex-col gap-2 items-stretch px-4 pb-4 relative z-10">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-muted-foreground">{language === "am" ? "ከ:" : "From:"} {new Date(campaign.start_date).toLocaleDateString()}</span>
                                        <span className="text-muted-foreground">{language === "am" ? "እስከ:" : "To:"} {new Date(campaign.end_date).toLocaleDateString()}</span>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => window.location.href = `/dashboard/campaigns/${campaign.id}`}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        {language === "am" ? "ዝርዝሮችን ይመልከቱ" : "See Details"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="border rounded-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">{language === "am" ? "ርዕስ" : "Title"}</th>
                                        <th className="px-4 py-3 text-left font-medium">{language === "am" ? "ሁኔታ" : "Status"}</th>
                                        <th className="px-4 py-3 text-left font-medium">{language === "am" ? "ክትባት" : "Vaccine"}</th>
                                        <th className="px-4 py-3 text-left font-medium">{language === "am" ? "ክልል" : "Region"}</th>
                                        <th className="px-4 py-3 text-left font-medium">{language === "am" ? "ቀኖች" : "Dates"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {filteredCampaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium">{campaign.title}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(campaign.status)}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                <MoreVertical className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start">
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(campaign.id, "active")}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                                                                <span>{language === "am" ? "ንቁ አድርግ" : "Active"}</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(campaign.id, "completed")}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                                                                <span>{language === "am" ? "አጠናቅ" : "Completed"}</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(campaign.id, "cancelled")}>
                                                                <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                                                <span>{language === "am" ? "ሰርዝ" : "Cancelled"}</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <div className="flex items-center px-2 py-1.5 text-sm text-destructive cursor-pointer hover:bg-destructive/10 rounded-sm">
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        <span>{language === "am" ? "ሰርዝ" : "Delete"}</span>
                                                                    </div>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>{language === "am" ? "እርግጠኛ ነዎት?" : "Are you sure?"}</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            {language === "am" ? "ይህ ተግባር ሊመለስ አይችልም።" : "This action cannot be undone."}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>{language === "am" ? "ተመለስ" : "Cancel"}</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDelete(campaign.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                            {language === "am" ? "ሰርዝ" : "Delete"}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="text-[10px]">{campaign.target_vaccine_code || (campaign as any).vaccine_code || (campaign as any).targetVaccineCode || (campaign as any).vaccine?.code || "N/A"}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{campaign.target_region}</td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </RoleProtected>
    )
}
