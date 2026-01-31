"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Search, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { getChildrenList, getInventory, recordVaccination } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"

export function RecordVaccinationForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchChild, setSearchChild] = useState("")
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [allChildren, setAllChildren] = useState<any[]>([]) // Cache all children
  const [filteredChildren, setFilteredChildren] = useState<any[]>([]) // Filtered results
  const [isLoadingChildren, setIsLoadingChildren] = useState(true)
  const [showResults, setShowResults] = useState(false)

  // Vaccine inventory search state
  const [searchVaccine, setSearchVaccine] = useState("")
  const [selectedVaccine, setSelectedVaccine] = useState<any>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [filteredInventory, setFilteredInventory] = useState<any[]>([])
  const [isLoadingInventory, setIsLoadingInventory] = useState(true)
  const [showVaccineResults, setShowVaccineResults] = useState(false)
  const [forceDropdownOpen, setForceDropdownOpen] = useState(false)

  const [formData, setFormData] = useState({
    vaccine_id: undefined as number | undefined,
    date_administered: new Date().toISOString().split('T')[0],
    batch_number: "",
    expiry_date: "",
    administration_site: "",
    dose_ml: "" as string | number,
    notes: "",
  })

  // Fetch all children on mount for fast client-side search
  useEffect(() => {
    const fetchAllChildren = async () => {
      try {
        setIsLoadingChildren(true)
        const response = await getChildrenList()

        if (response.error) {
          console.error("[RecordVaccinationForm] Error fetching children:", response.error)
          setAllChildren([])
          return
        }
        const responseData = response.data as any
        const childrenData = responseData?.data || responseData?.children || responseData || []
        const childrenArray = Array.isArray(childrenData) ? childrenData : []
        setAllChildren(childrenArray)
      } catch (err) {
        console.error("[RecordVaccinationForm] Error:", err)
        setAllChildren([])
      } finally {
        setIsLoadingChildren(false)
      }
    }

    fetchAllChildren()
  }, [])

  // Set current date/time on component mount
  useEffect(() => {
    const now = new Date()
    setFormData(prev => ({
      ...prev,
      date_administered: now.toISOString().split('T')[0],
    }))
  }, [])

  // Fetch inventory for vaccine search
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoadingInventory(true)
        const res = await getInventory()
        if (res.error) {
          console.error("[RecordVaccinationForm] Error fetching inventory:", res.error)
          setInventory([])
        } else {
          const data = (res.data as any)?.inventory || (res.data as any)?.data || res.data || []
          setInventory(Array.isArray(data) ? data : [])
        }
      } catch (e) {
        console.error("[RecordVaccinationForm] Inventory error:", e)
        setInventory([])
      } finally {
        setIsLoadingInventory(false)
      }
    }
    fetchInventory()
  }, [])

  // Set filtered inventory to all available vaccines by default
  useEffect(() => {
    setFilteredInventory(inventory)
  }, [inventory])

  // Fast API-based search with debouncing
  useEffect(() => {
    // Clear results if search is empty
    if (!searchChild.trim()) {
      setFilteredChildren([])
      setShowResults(false)
      setError("")
      return
    }

    // Don't search if child is already selected and matches search
    if (selectedChild && selectedChild.name.toLowerCase() === searchChild.toLowerCase().trim()) {
      return
    }

    // Reduce debounce time for more responsive typing
    const timeoutId = setTimeout(async () => {
      const searchLower = searchChild.toLowerCase().trim()
      
      try {
        setIsLoadingChildren(true)
        console.log("[RecordVaccinationForm] Searching for:", searchLower)
        
        // Try multiple case variations for case-insensitive search
        const searchVariations = [
          searchLower,                    // eliah
          searchLower.charAt(0).toUpperCase() + searchLower.slice(1), // Eliah
          searchLower.toUpperCase(),      // ELIAH
        ]
        
        let response = null
        let foundResults = false
        
        // Try each variation until we find results
        for (const variation of searchVariations) {
          console.log("[RecordVaccinationForm] Trying variation:", variation)
          response = await getChildrenList(variation)
          console.log("[RecordVaccinationForm] API response for", variation, ":", response)
          
          if (!response.error && response.data) {
            const responseData = response.data as any
            const childrenData = responseData?.data || responseData?.children || responseData || []
            const childrenArray = Array.isArray(childrenData) ? childrenData : []
            
            if (childrenArray.length > 0) {
              console.log("[RecordVaccinationForm] Found results with:", variation)
              foundResults = true
              break
            }
          }
        }
        
        if (!foundResults || !response) {
          console.log("[RecordVaccinationForm] No results found for any variation")
          setFilteredChildren([])
          setShowResults(true)
          setError("No children found")
          setIsLoadingChildren(false)
          return
        }
        
        if (response.error) {
          console.error("[RecordVaccinationForm] Search error:", response.error)
          setFilteredChildren([])
          setError("Failed to search children")
          return
        }
        const responseData = response.data as any
        console.log("[RecordVaccinationForm] Response data:", responseData)
        const childrenData = responseData?.data || responseData?.children || responseData || []
        const childrenArray = Array.isArray(childrenData) ? childrenData : []
        console.log("[RecordVaccinationForm] Children array:", childrenArray)
        
        // Additional client-side filtering as backup
        const filtered = childrenArray.filter((child: any) => {
          const childName = `${child.first_name} ${child.last_name}`.toLowerCase()
          const childId = child.id?.toString().toLowerCase() || ""
          return childName.includes(searchLower) || childId.includes(searchLower)
        })
        console.log("[RecordVaccinationForm] Filtered results:", filtered)
        
        // Sort by relevance - exact matches first, then starts with, then contains
        const sorted = filtered.sort((a: any, b: any) => {
          const aFirstName = (a.first_name || "").toLowerCase()
          const aLastName = (a.last_name || "").toLowerCase()
          const aFullName = `${aFirstName} ${aLastName}`.trim()
          const bFirstName = (b.first_name || "").toLowerCase()
          const bLastName = (b.last_name || "").toLowerCase()
          const bFullName = `${bFirstName} ${bLastName}`.trim()
          
          const aStartsWith = aFirstName.startsWith(searchLower) || aLastName.startsWith(searchLower) ? 1 : 0
          const bStartsWith = bFirstName.startsWith(searchLower) || bLastName.startsWith(searchLower) ? 1 : 0
          
          if (aStartsWith !== bStartsWith) return bStartsWith - aStartsWith
          
          // Then sort alphabetically
          return aFullName.localeCompare(bFullName)
        })

        setFilteredChildren(sorted)
        setShowResults(true)
        setError("")
      } catch (err) {
        console.error("[RecordVaccinationForm] Search error:", err)
        setFilteredChildren([])
        setError("Search failed")
      } finally {
        setIsLoadingChildren(false)
      }
    }, 200) // Reduced from 300ms to 200ms for faster response

    return () => clearTimeout(timeoutId)
  }, [searchChild, selectedChild])


  const handleSelectChild = (child: any) => {
    const childName = child.first_name && child.last_name
      ? `${child.first_name} ${child.last_name}`
      : child.name || "Unknown"
    
    setSelectedChild({
      id: child.id,
      name: childName,  
      dateOfBirth: child.date_of_birth || child.dateOfBirth,
      guardian: child.parent?.name || child.user?.name || "-",
    })
    setFilteredChildren([])
    setShowResults(false)
    setSearchChild(childName)
    setError("")
  }

  const handleSelectVaccine = (item: any) => {
    console.log("[RecordVaccinationForm] handleSelectVaccine called with:", item)
    const vaccineName = item.vaccine?.name || item.vaccineName || item.name || "Vaccine"
    const vaccineId = item.vaccine?.id || item.vaccine_id || item.id || item.vaccineId
    const batch = item.batch_number || item.batchNumber || ""
    const expiry = item.expiry_date || item.expiryDate || ""
    console.log("[RecordVaccinationForm] Setting vaccine:", { vaccineName, vaccineId, batch, expiry })
    setSelectedVaccine({
      id: vaccineId,
      name: vaccineName,
      batch_number: batch,
      expiry_date: expiry,
    })
    setFormData(prev => ({
      ...prev,
      vaccine_id: vaccineId ? Number(vaccineId) : undefined,
      batch_number: batch,
      expiry_date: expiry,
    }))
    setSearchVaccine(vaccineName)
    // Don't clear filtered inventory - keep it available for reselection
    setShowVaccineResults(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedChild) {
      setError("Please search and select a child first")
      return
    }

    if (!formData.vaccine_id || !formData.batch_number || !formData.expiry_date || !formData.administration_site) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const payload: any = {
        vaccine_id: formData.vaccine_id!,
        date_administered: formData.date_administered,
        batch_number: formData.batch_number,
        administration_site: formData.administration_site,
        expiry_date: formData.expiry_date,
        notes: formData.notes || undefined,
      }
      if (formData.dose_ml !== "" && formData.dose_ml !== undefined) payload.dose_ml = Number(formData.dose_ml)

      const response = await recordVaccination(selectedChild.id, payload)

      if (response.error) {
        setError(response.error.message || "Failed to record vaccination")
        setLoading(false)
        return
      }

      toast({
        title: "Success",
        description: "Vaccination recorded successfully",
      })

      router.push("/dashboard/vaccinations")
    } catch (err) {
      setError("Failed to record vaccination")
      console.error("[RecordVaccinationForm] Error:", err)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Select Child</h3>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isLoadingChildren ? "Loading children..." : "Start typing child name or ID..."}
              value={searchChild}
              onChange={(e) => {
                const value = e.target.value
                setSearchChild(value)
                if (value.trim() === "") {
                  setFilteredChildren([])
                  setSelectedChild(null)
                  setShowResults(false)
                } else {
                  setSelectedChild(null)
                }
              }}
              onFocus={() => {
                if (filteredChildren.length > 0 && searchChild.trim()) {
                  setShowResults(true)
                }
              }}
              onBlur={() => {
                // Delay hiding to allow click on results
                setTimeout(() => setShowResults(false), 200)
              }}
              className="pl-9"
              disabled={!!selectedChild || isLoadingChildren}
            />
            {isLoadingChildren && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Live search results dropdown - instant client-side filtering */}
          {showResults && filteredChildren.length > 0 && (
            <Card className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto shadow-lg border bg-background">
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-2 py-1 mb-1">
                  {filteredChildren.length} {filteredChildren.length === 1 ? "child found" : "children found"}
                </p>
                <div className="space-y-1">
                  {filteredChildren.slice(0, 10).map((child: any) => {
                    const childName = child.first_name && child.last_name
                      ? `${child.first_name} ${child.last_name}`
                      : child.name || "Unknown"
                    return (
                      <div
                        key={child.id}
                        className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-primary/20"
                        onMouseDown={(e) => {
                          e.preventDefault() // Prevent input blur
                          handleSelectChild(child)
                        }}
                      >
                        <p className="font-medium text-foreground">{childName}</p>
                        <p className="text-sm text-muted-foreground">
                          DOB: {child.date_of_birth ? new Date(child.date_of_birth).toLocaleDateString() : "N/A"}
                          {child.parent?.name && ` • Guardian: ${child.parent.name}`}
                        </p>
                        {child.id && (
                          <p className="text-xs text-muted-foreground font-mono mt-1">ID: {child.id}</p>
                        )}
                      </div>
                    )
                  })}
                  {filteredChildren.length > 10 && (
                    <p className="text-xs text-muted-foreground px-2 py-1 text-center">
                      Showing first 10 results. Type more to narrow down.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {showResults && filteredChildren.length === 0 && searchChild.trim() && !isLoadingChildren && (
            <Card className="absolute z-50 w-full mt-2 shadow-lg border bg-background">
              <div className="p-4 text-center text-sm text-muted-foreground">
                No children found matching "{searchChild}"
              </div>
            </Card>
          )}
        </div>

        {selectedChild && (
          <Card className="p-4 bg-muted/50 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{selectedChild.name}</p>
                <p className="text-sm text-muted-foreground">
                  DOB: {selectedChild.dateOfBirth ? new Date(selectedChild.dateOfBirth).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">Guardian: {selectedChild.guardian}</p>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedChild(null)
                  setSearchChild("")
                  setFilteredChildren([])
                  setShowResults(false)
                }}
              >
                {t("form.change", language) || "Change"}
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Vaccination Details</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vaccineSelect">Select Vaccine *</Label>
            <Select
              value={selectedVaccine ? `${selectedVaccine.id}|||${selectedVaccine.batch_number}` : ""}
              onValueChange={(value) => {
                console.log("[RecordVaccinationForm] Vaccine selected:", value)
                const [vaccineId, batchNumber] = value.split('|||')
                console.log("[RecordVaccinationForm] Parsed:", { vaccineId, batchNumber })
                const vaccine = filteredInventory.find((item: any) => {
                  const itemVaccineId = item.vaccine?.id?.toString() || item.vaccine_id?.toString() || item.id?.toString() || item.vaccineId?.toString()
                  const itemBatch = item.batch_number || item.batchNumber || ""
                  console.log("[RecordVaccinationForm] Checking item:", { itemVaccineId, itemBatch, match: itemVaccineId === vaccineId && itemBatch === batchNumber })
                  return itemVaccineId === vaccineId && itemBatch === batchNumber
                })
                console.log("[RecordVaccinationForm] Found vaccine:", vaccine)
                if (vaccine) {
                  handleSelectVaccine(vaccine)
                } else {
                  console.error("[RecordVaccinationForm] No vaccine found for selection:", value)
                }
              }}
              disabled={isLoadingInventory}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingInventory ? "Loading vaccines..." : "Select a vaccine from inventory"} />
              </SelectTrigger>
              <SelectContent>
                {filteredInventory.map((item: any) => {
                  const vaccineName = item.vaccine?.name || item.vaccineName || item.name || "Unknown Vaccine"
                  const vaccineCode = item.vaccine?.code || item.code || ""
                  const batch = item.batch_number || item.batchNumber || ""
                  const stock = item.stock || item.quantity || 0
                  const vaccineId = item.vaccine?.id || item.vaccine_id || item.id || item.vaccineId
                  
                  return (
                    <SelectItem key={`${vaccineId}|||${batch}`} value={`${vaccineId}|||${batch}`}>
                      <div className="flex flex-col">
                        <span className="font-medium">{vaccineName}</span>
                        <span className="text-xs text-muted-foreground">
                          {vaccineCode && `Code: ${vaccineCode}`}
                          {batch && ` • Batch: ${batch}`}
                          {stock !== undefined && ` • Stock: ${stock}`}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {selectedVaccine && (
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("[RecordVaccinationForm] Change button clicked")
                    setSelectedVaccine(null)
                    setFormData(prev => ({ 
                      ...prev, 
                      vaccine_id: undefined, 
                      batch_number: "", 
                      expiry_date: "" 
                    }))
                    console.log("[RecordVaccinationForm] Vaccine selection cleared")
                  }}
                >
                  Change Vaccine
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_administered">Date Administered *</Label>
            <Input
              id="date_administered"
              type="date"
              value={formData.date_administered}
              onChange={(e) => setFormData({ ...formData, date_administered: e.target.value })}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {selectedVaccine && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Batch Number</Label>
              <Input value={formData.batch_number} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input value={formData.expiry_date} disabled className="bg-muted" />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="site">Injection Site *</Label>
            <Select value={formData.administration_site} onValueChange={(value) => setFormData({ ...formData, administration_site: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select injection site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Left arm">Left Upper Arm</SelectItem>
                <SelectItem value="Right arm">Right Upper Arm</SelectItem>
                <SelectItem value="Left thigh">Left Thigh</SelectItem>
                <SelectItem value="Right thigh">Right Thigh</SelectItem>
                <SelectItem value="Oral">Oral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dose_ml">Dose (ml)</Label>
            <Input
              id="dose_ml"
              type="number"
              step="0.01"
              placeholder="e.g., 0.50"
              value={formData.dose_ml as any}
              onChange={(e) => setFormData({ ...formData, dose_ml: e.target.value })}
            />
          </div>
        </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || !selectedChild || !formData.vaccine_id} className="min-w-[160px]">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Recording...
            </>
          ) : (
            "Record Vaccination"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
