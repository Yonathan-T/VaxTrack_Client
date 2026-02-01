"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Syringe } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { getChildrenList, recordVaccination, recordCampaignVaccination } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"

interface CampaignVaccinationFormProps {
  campaignId: string
  campaignVaccineCode: string
  campaignVaccineName: string
  targetVaccine?: any  // Add targetVaccine object
  preSelectedChild?: any
  onSuccess?: () => void
}

export function CampaignVaccinationForm({ 
  campaignId, 
  campaignVaccineCode, 
  campaignVaccineName,
  targetVaccine,
  preSelectedChild,
  onSuccess 
}: CampaignVaccinationFormProps) {
  const router = useRouter()
  const { language } = useLanguage()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchChild, setSearchChild] = useState("")
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [allChildren, setAllChildren] = useState<any[]>([])
  const [filteredChildren, setFilteredChildren] = useState<any[]>([])
  const [isLoadingChildren, setIsLoadingChildren] = useState(true)
  const [showResults, setShowResults] = useState(false)

  const [formData, setFormData] = useState({
    batch_number: "",
    date_administered: new Date().toISOString().split('T')[0],
  })

  // Fetch all children on mount for fast client-side search
  useEffect(() => {
    const fetchAllChildren = async () => {
      try {
        setIsLoadingChildren(true)
        const response = await getChildrenList()

        if (response.error) {
          console.error("[CampaignVaccinationForm] Error fetching children:", response.error)
          setAllChildren([])
          return
        }
        const responseData = response.data as any
        const childrenData = responseData?.data || responseData?.children || responseData || []
        const childrenArray = Array.isArray(childrenData) ? childrenData : []
        
        console.log("[CampaignVaccinationForm] Fetched children:", childrenArray)
        setAllChildren(childrenArray)
      } catch (err: any) {
        console.error("[CampaignVaccinationForm] Error:", err)
        setAllChildren([])
      } finally {
        setIsLoadingChildren(false)
      }
    }

    fetchAllChildren()
  }, [])

  // Pre-fill form if a child is provided
  useEffect(() => {
    if (preSelectedChild) {
      console.log("[CampaignVaccinationForm] Pre-filling with child:", preSelectedChild)
      setSelectedChild(preSelectedChild)
      setSearchChild(preSelectedChild.child_name || preSelectedChild.name || `${preSelectedChild.first_name} ${preSelectedChild.last_name}`)
      setShowResults(false)
      setError("")
    }
  }, [preSelectedChild])

  // Fast client-side search with debouncing
  useEffect(() => {
    // Clear results if search is empty
    if (!searchChild.trim()) {
      setFilteredChildren([])
      setShowResults(false)
      setError("")
      return
    }

    // Don't search if child is already selected and matches search
    if (selectedChild) {
      const childName = selectedChild.child_name || selectedChild.name || `${selectedChild.first_name || ''} ${selectedChild.last_name || ''}`.trim()
      if (childName.toLowerCase() === searchChild.toLowerCase().trim()) {
        return
      }
    }

    // Reduce debounce time for more responsive typing
    const timeoutId = setTimeout(() => {
      const searchLower = searchChild.toLowerCase().trim()
      
      // Filter children from cached list
      const filtered = allChildren.filter((child: any) => {
        const childName = (child.child_name || child.name || `${child.first_name || ''} ${child.last_name || ''}`.trim() || "").toLowerCase()
        const parentName = (child.parent_name || "").toLowerCase()
        const childId = (child.id || "").toString()
        
        return childName.includes(searchLower) || 
               parentName.includes(searchLower) || 
               childId.includes(searchLower)
      })
      
      console.log("[CampaignVaccinationForm] Search results:", filtered)
      setFilteredChildren(filtered)
      setShowResults(true)
      setError("")
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [searchChild, allChildren, selectedChild])

  const handleSelectChild = (child: any) => {
    console.log("[CampaignVaccinationForm] handleSelectChild called with:", child)
    setSelectedChild(child)
    setSearchChild(child.child_name || child.name || `${child.first_name || ''} ${child.last_name || ''}`.trim())
    setShowResults(false)
    setError("")
  }

  const clearChildSelection = () => {
    setSelectedChild(null)
    setSearchChild("")
    setShowResults(false)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedChild) {
      setError("Please select a child")
      return
    }

    if (!formData.batch_number) {
      setError("Please enter batch number")
      return
    }

    try {
      setLoading(true)
      console.log("[CampaignVaccinationForm] Submitting vaccination record...")
      
      const payload: any = {
        child_id: selectedChild.id,
        campaign_id: campaignId,
        vaccine_code: campaignVaccineCode, // Use campaign vaccine code instead of inventory
        batch_number: formData.batch_number,
        date_administered: new Date().toISOString().split('T')[0], // Use current date
      }

      console.log("[CampaignVaccinationForm] Payload:", payload)

      const response = await recordVaccination(selectedChild.id, {
        vaccine_id: targetVaccine?.id || parseInt(campaignVaccineCode),
        date_administered: formData.date_administered,
        batch_number: formData.batch_number,
        administration_site: "left_arm", // Default value
        expiry_date: "", // Empty for now
        campaign_id: parseInt(campaignId), // Add campaign context
      })
      console.log("[CampaignVaccinationForm] Response:", response)

      if (response.error) {
        setError(response.error.message || "Failed to record vaccination")
        return
      }

      toast({
        title: language === "am" ? "ተሳክቷል" : "Success",
        description: language === "am" ? "ቫይረስ በተሳካ ሁኔታ ተመዝግቧል" : "Vaccination recorded successfully",
      })

      // Reset form
      setSelectedChild(null)
      setSearchChild("")
      setFormData({
        batch_number: "",
        date_administered: new Date().toISOString().split('T')[0],
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }

    } catch (err: any) {
      console.error("[CampaignVaccinationForm] Submit error:", err)
      setError(err.message || "Failed to record vaccination")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Child Search */}
      <div className="space-y-2">
        <Label htmlFor="childSearch">Search Child *</Label>
        <div className="relative">
          <Input
            id="childSearch"
            value={searchChild}
            onChange={(e) => setSearchChild(e.target.value)}
            placeholder={language === "am" ? "ህፃናትን ይፈልጉ..." : "Search children by name, parent, or ID..."}
            className="pr-10"
          />
          {selectedChild && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearChildSelection}
              title="Clear selection"
            >
              ×
            </Button>
          )}

          {/* Search Results Dropdown */}
          {showResults && filteredChildren.length > 0 && (
            <Card className="absolute z-10 w-full max-h-60 overflow-y-auto mt-1">
              <div className="p-2">
                {filteredChildren.map((child: any) => (
                  <div
                    key={child.id}
                    className="p-2 hover:bg-muted cursor-pointer rounded"
                    onClick={() => handleSelectChild(child)}
                  >
                    <div className="font-medium">{child.child_name || child.name || `${child.first_name || ''} ${child.last_name || ''}`.trim()}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {child.id} • Parent: {child.parent_name || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {showResults && searchChild.trim() && filteredChildren.length === 0 && !isLoadingChildren && (
            <Card className="absolute z-10 w-full mt-1">
              <div className="p-4 text-center text-muted-foreground">
                {language === "am" ? "ህፃናት አልተገኙም" : "No children found"}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Selected Child Info */}
      {selectedChild && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{selectedChild.child_name || selectedChild.name || `${selectedChild.first_name || ''} ${selectedChild.last_name || ''}`.trim()}</div>
              <div className="text-sm text-muted-foreground">
                ID: {selectedChild.id} • Age: {selectedChild.age || 'N/A'} • Gender: {selectedChild.gender || 'N/A'}
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={clearChildSelection}>
              Change
            </Button>
          </div>
        </Card>
      )}

      {/* Campaign Vaccine Info (Read-only) */}
      <div className="space-y-2">
        <Label>Campaign Vaccine *</Label>
        <Input
          value={`${campaignVaccineName} (${campaignVaccineCode})`}
          readOnly
          className="bg-muted"
          title={`This vaccine is set by the campaign: ${campaignVaccineName}`}
        />
        <p className="text-xs text-muted-foreground">
          Vaccine is automatically set by the campaign and cannot be changed
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateAdministered">Date Administered *</Label>
          <Input
            id="dateAdministered"
            type="date"
            value={formData.date_administered}
            onChange={(e) => setFormData(prev => ({ ...prev, date_administered: e.target.value }))}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="batchNumber">Batch Number *</Label>
          <Input
            id="batchNumber"
            value={formData.batch_number}
            onChange={(e) => setFormData(prev => ({ ...prev, batch_number: e.target.value }))}
            placeholder="Enter batch number"
            required
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || !selectedChild} className="min-w-[160px]">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {language === "am" ? "በመመዝግብ ላይ..." : "Recording..."}
            </>
          ) : (
            <>
              <Syringe className="h-4 w-4 mr-2" />
              {language === "am" ? "ቫይረስ ይመዝግቡ" : "Record Vaccination"}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {language === "am" ? "ይሰርዙ" : "Cancel"}
        </Button>
      </div>
    </form>
  )
}
