"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getFacilities, createFacility, updateFacility, deleteFacility, type Facility } from "@/lib/official-api"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/user-context"
import { Plus, Trash2, Building, Pencil, Loader2, MapPin, Users, Search, Clock, Phone, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"

export default function FacilitiesPage() {
    const { user: currentUser } = useUser()
    const { toast } = useToast()
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingFacility, setEditingFacility] = useState<Facility | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        address: "",
        woreda: "",
        daily_capacity: 0
    })

    const loadFacilities = async () => {
        try {
            setIsLoading(true)
            const { data, error } = await getFacilities()
            if (!error && data) {
                const payload: any = data
                const facilitiesArray =
                    (Array.isArray(payload) && payload) ||
                    (Array.isArray(payload?.facilities) && payload.facilities) ||
                    (Array.isArray(payload?.data) && payload.data) ||
                    []
                setFacilities(facilitiesArray as Facility[])
            }
        } catch (e) {
            console.error("Failed to load facilities", e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadFacilities()
    }, [])

    const handleAddFacility = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)
        try {
            const { error } = await createFacility(formData as any)
            if (error) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to create facility",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Success",
                    description: "Facility created successfully",
                })
                setIsAddModalOpen(false)
                setFormData({ name: "", location: "", address: "", woreda: "", daily_capacity: 0 })
                loadFacilities()
            }
        } catch (err) {
            console.error("Create facility error:", err)
        } finally {
            setIsCreating(false)
        }
    }

    const handleUpdateFacility = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingFacility) return
        setIsCreating(true)
        try {
            const { error } = await updateFacility(String(editingFacility.id), formData as any)
            if (error) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to update facility",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Success",
                    description: "Facility updated successfully",
                })
                setEditingFacility(null)
                setFormData({ name: "", location: "", address: "", woreda: "", daily_capacity: 0 })
                loadFacilities()
            }
        } catch (err) {
            console.error("Update facility error:", err)
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteFacility = async (id: string) => {
        try {
            const { error } = await deleteFacility(id)
            if (error) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to delete facility",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Success",
                    description: "Facility deleted successfully",
                })
                loadFacilities()
            }
        } catch (err) {
            console.error("Delete facility error:", err)
        } finally {
            setIsDeleting(null)
        }
    }

    const startEdit = (f: Facility) => {
        setEditingFacility(f)
        setFormData({
            name: f.name,
            location: f.location,
            address: f.address || "",
            woreda: f.woreda || "",
            daily_capacity: f.daily_capacity
        })
    }

    const filtered = facilities.filter((f) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
            f.name.toLowerCase().includes(q) ||
            f.location.toLowerCase().includes(q) ||
            (f.address || "").toLowerCase().includes(q)
        )
    })

    const isSuperAdmin = currentUser?.role === "admin" && (currentUser as any)?.facility_id == null && (currentUser as any)?.facility == null
    const isHealthOfficial = currentUser?.role === "health_official"

    if (!isSuperAdmin && !isHealthOfficial && !isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Facilities</h1>
                    <p className="text-sm text-muted-foreground">Manage vaccination centers and facilities</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Facility
                </Button>
            </div>

            <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search facilities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {isLoading ? "Loading..." : `${filtered.length} facilities`}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="p-6 h-48 animate-pulse bg-muted/20" />
                    ))
                ) : filtered.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Building className="h-12 w-12 mb-4 opacity-20" />
                        <p>No facilities found.</p>
                    </div>
                ) : (
                    filtered.map((f) => (
                        <Card key={f.id} className="p-6 hover:shadow-lg transition-all duration-300 relative group overflow-hidden border-l-4 border-l-primary">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <Building className="h-6 w-6" />
                                </div>
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/dashboard/facilities/${f.id}`, '_self')}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(f)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setIsDeleting(String(f.id))}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-foreground mb-1">{f.name}</h3>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{f.location} {f.address ? `- ${f.address}` : ""}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>{f.phone}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{f.opens_at ? f.opens_at.substring(0, 5) : 'N/A'} - {f.closes_at ? f.closes_at.substring(0, 5) : 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>Daily Capacity: {f.daily_capacity}</span>
                                </div>
                                {f.num_nurses !== undefined && f.num_nurses !== null && (
                                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>Nurses: {f.num_nurses}</span>
                                    </div>
                                )}
                                {f.users_count !== undefined && (
                                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>Staff Members: {f.users_count}</span>
                                    </div>
                                )}
                                <div className="mt-4">
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-primary border-primary/20">
                                        ID: {f.id}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            <Dialog
                open={isAddModalOpen || editingFacility !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsAddModalOpen(false)
                        setEditingFacility(null)
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFacility ? "Edit Facility" : "Add New Facility"}</DialogTitle>
                        <DialogDescription>
                            {editingFacility ? "Update the details of the existing facility." : "Register a new vaccination center in the system."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={editingFacility ? handleUpdateFacility : handleAddFacility} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="fac-name">Facility Name</Label>
                            <Input
                                id="fac-name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Central Health Bureau"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location (City, Sub-city)</Label>
                            <Input
                                id="location"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Bole, Addis Ababa"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Detailed Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Bole District, Road 4"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="woreda">Woreda (Optional)</Label>
                                <Input
                                    id="woreda"
                                    value={formData.woreda}
                                    onChange={(e) => setFormData({ ...formData, woreda: e.target.value })}
                                    placeholder="Woreda 03"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Daily Target Capacity (Children)</Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={formData.daily_capacity}
                                onChange={(e) => setFormData({ ...formData, daily_capacity: parseInt(e.target.value) || 0 })}
                                placeholder="50"
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setEditingFacility(null); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingFacility ? "Update Facility" : "Create Facility"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleting !== null} onOpenChange={(open) => !open && setIsDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Facility?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this facility from the system.
                            Staff and inventory associated with this facility may be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => isDeleting && handleDeleteFacility(isDeleting)}
                        >
                            Delete Facility
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
