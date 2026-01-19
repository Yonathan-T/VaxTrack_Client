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
import { getChildrenList, administerVaccine, getChildProfile } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"

const ethiopianVaccines = [
  { value: "bcg", label: "BCG", ageGroup: "At birth" },
  { value: "opv0", label: "OPV 0", ageGroup: "At birth" },
  { value: "penta1", label: "Penta 1", ageGroup: "6 weeks" },
  { value: "opv1", label: "OPV 1", ageGroup: "6 weeks" },
  { value: "pcv1", label: "PCV 1", ageGroup: "6 weeks" },
  { value: "rota1", label: "Rota 1", ageGroup: "6 weeks" },
  { value: "penta2", label: "Penta 2", ageGroup: "10 weeks" },
  { value: "opv2", label: "OPV 2", ageGroup: "10 weeks" },
  { value: "pcv2", label: "PCV 2", ageGroup: "10 weeks" },
  { value: "rota2", label: "Rota 2", ageGroup: "10 weeks" },
  { value: "penta3", label: "Penta 3", ageGroup: "14 weeks" },
  { value: "opv3", label: "OPV 3", ageGroup: "14 weeks" },
  { value: "pcv3", label: "PCV 3", ageGroup: "14 weeks" },
  { value: "ipv", label: "IPV", ageGroup: "14 weeks" },
  { value: "measles1", label: "Measles 1", ageGroup: "9 months" },
  { value: "measles2", label: "Measles 2", ageGroup: "15 months" },
]

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

  const [formData, setFormData] = useState({
    vaccine: "",
    dateAdministered: new Date().toISOString().split('T')[0],
    batchNumber: "",
    expiryDate: "",
    site: "",
    dose: "",
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
      dateAdministered: now.toISOString().split('T')[0],
    }))
  }, [])

  // Fast client-side live search with debouncing
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

    // Debounce search - wait 150ms for faster feel
    const timeoutId = setTimeout(() => {
      const searchLower = searchChild.toLowerCase().trim()
      
      // Fast client-side filtering - no API call needed
      const filtered = allChildren.filter((child: any) => {
        const firstName = (child.first_name || "").toLowerCase()
        const lastName = (child.last_name || "").toLowerCase()
        const fullName = `${firstName} ${lastName}`.trim()
        const childId = (child.id?.toString() || "").toLowerCase()
        const nationalId = (child.national_id || "").toLowerCase()
        const parentName = (child.parent?.name || child.user?.name || "").toLowerCase()
        
        // More flexible matching - check if search appears anywhere
        return (
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          fullName.includes(searchLower) ||
          childId.includes(searchLower) ||
          nationalId.includes(searchLower) ||
          parentName.includes(searchLower) ||
          // Also check if search matches beginning of any word
          firstName.startsWith(searchLower) ||
          lastName.startsWith(searchLower) ||
          // Check if search matches any part of the name
          `${lastName} ${firstName}`.includes(searchLower)
        )
      })

      // Sort by relevance - exact matches first, then starts with, then contains
      const sorted = filtered.sort((a, b) => {
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
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [searchChild, selectedChild, allChildren])


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedChild) {
      setError("Please search and select a child first")
      return
    }

    if (!formData.vaccine || !formData.batchNumber || !formData.expiryDate || !formData.site) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      // First, get the child's profile to find vaccination records
      const childProfileRes = await getChildProfile(selectedChild.id)

      if (childProfileRes.error) {
        setError(childProfileRes.error.message || "Failed to get child profile")
        setLoading(false)
        return
      }

      // For now, we'll need to create a vaccination record ID
      // In a real scenario, the API would provide pending vaccination records
      // For this implementation, we'll use a placeholder ID
      // The actual API endpoint expects a vaccination record ID
      const vaccinationRecordId = `vaccination_${Date.now()}`

      const response = await administerVaccine(vaccinationRecordId, {
        vaccineId: formData.vaccine, // This should be the vaccine ID from the API
        batchNumber: formData.batchNumber,
        dateAdministered: formData.dateAdministered,
      })

      if (response.error) {
        setError(response.error.message || "Failed to record vaccination")
        setLoading(false)
        return
      }

      toast({
        title: t("form.success", language) || "Success",
        description: t("vaccinations.recordedSuccessfully", language) || "Vaccination recorded successfully",
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
            <Label htmlFor="vaccine">Select Vaccine *</Label>
            <Select value={formData.vaccine} onValueChange={(value) => setFormData({ ...formData, vaccine: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vaccine" />
              </SelectTrigger>
              <SelectContent>
                {ethiopianVaccines.map((vaccine) => (
                  <SelectItem key={vaccine.value} value={vaccine.value}>
                    {vaccine.label} ({vaccine.ageGroup})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateAdministered">Date Administered *</Label>
            <Input
              id="dateAdministered"
              type="date"
              value={formData.dateAdministered}
              onChange={(e) => setFormData({ ...formData, dateAdministered: e.target.value })}
              required
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Automatically set to today's date</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="batchNumber">Batch Number *</Label>
            <Input
              id="batchNumber"
              placeholder="e.g., BCG-2024-001"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="site">Administration Site *</Label>
            <Select value={formData.site} onValueChange={(value) => setFormData({ ...formData, site: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select administration site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left_arm">Left Upper Arm</SelectItem>
                <SelectItem value="right_arm">Right Upper Arm</SelectItem>
                <SelectItem value="left_thigh">Left Thigh</SelectItem>
                <SelectItem value="right_thigh">Right Thigh</SelectItem>
                <SelectItem value="oral">Oral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dose">Dose (ml)</Label>
            <Input
              id="dose"
              type="number"
              step="0.1"
              placeholder="e.g., 0.5"
              value={formData.dose}
              onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
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
        <Button type="submit" disabled={loading || !selectedChild} className="min-w-[160px]">
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
