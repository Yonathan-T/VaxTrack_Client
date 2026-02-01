"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Globe, Save, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { createSubCity } from "@/lib/admin-api"

interface AddSubcityModalProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function AddSubcityModal({ children, onSuccess }: AddSubcityModalProps) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    google_maps_url: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.address.trim()) {
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" 
          ? "ስም እና አድራሻ ግዴታ ናቸው" 
          : "Name and address are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        google_maps_url: formData.google_maps_url.trim() || null
      }

      console.log("[AddSubcityModal] Submitting payload:", payload)
      
      // Make the actual API call
      const response = await createSubCity(payload)
      console.log("[AddSubcityModal] API response:", response)
      
      toast({
        title: language === "am" ? "ተሳክቷል" : "Success",
        description: language === "am" 
          ? "ንዑስ ከተማው በተሳካ ሁኔታ ተመዝግቧል" 
          : "Sub-city has been created successfully",
      })
      
      // Reset form
      setFormData({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        google_maps_url: ""
      })
      
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("[AddSubcityModal] Error creating sub-city:", error)
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: error.message || (language === "am" ? "ንዑስ ከተማውን መፍጠር አልተቻለም" : "Failed to create sub-city"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {language === "am" ? "ንዑስ ከተማ ይጨምሩ" : "Add Subcity"}
          </DialogTitle>
          <DialogDescription>
            {language === "am" 
              ? "አዲስ ንዑስ ከተማ ይፍጠሩ እና ያስተዳድሩ" 
              : "Create and manage a new sub-city"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name - Required */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              {language === "am" ? "ስም *" : "Name *"}
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={language === "am" ? "ንዑስ ከተማው ስም ያስገቡ" : "Enter sub-city name"}
              required
              className="w-full"
            />
          </div>

          {/* Address - Required */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {language === "am" ? "አድራሻ *" : "Address *"}
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder={language === "am" 
                ? "ንዑስ ከተማው ዝርዝር አድራሻ ያስገቡ" 
                : "Enter detailed sub-city address"}
              required
              rows={3}
              className="w-full resize-none"
            />
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {language === "am" ? "አማራጭ መረጃዎች" : "Optional Information"}
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Latitude */}
              <div className="space-y-2">
                <Label htmlFor="latitude">
                  {language === "am" ? "ኬክሮስ (Latitude)" : "Latitude"}
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  placeholder="9.0123456"
                />
              </div>

              {/* Longitude */}
              <div className="space-y-2">
                <Label htmlFor="longitude">
                  {language === "am" ? "ኬክሮስ (Longitude)" : "Longitude"}
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  placeholder="38.7654321"
                />
              </div>
            </div>

            {/* Google Maps URL */}
            <div className="space-y-2">
              <Label htmlFor="google_maps_url" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {language === "am" ? "Google Maps URL" : "Google Maps URL"}
              </Label>
              <Input
                id="google_maps_url"
                type="url"
                value={formData.google_maps_url}
                onChange={(e) => handleInputChange("google_maps_url", e.target.value)}
                placeholder="https://maps.google.com/?q=addis+ketema"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {language === "am" ? "ይቅር" : "Cancel"}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-600/80 hover:bg-green-600/90 text-white border-green-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === "am" ? "በመፍጠር ላይ..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {language === "am" ? "ንዑስ ከተማ ይፍጠሩ" : "Create Subcity"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
