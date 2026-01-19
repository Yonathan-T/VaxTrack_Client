"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { getFacilityCapacity, Capacity } from "@/lib/healthcare-worker-api"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function FacilityCapacity() {
  const { language } = useLanguage()
  const { user } = useUser()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [capacity, setCapacity] = useState<Capacity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [facilityId, setFacilityId] = useState<string>("")

  const handleCheckCapacity = async () => {
    if (!facilityId) {
      toast({
        title: t("common.error", language) || "Error",
        description: "Please enter a facility ID",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await getFacilityCapacity(facilityId, selectedDate)
      
      if (response.error) {
        toast({
          title: t("common.error", language) || "Error",
          description: response.error.message || "Failed to fetch capacity",
          variant: "destructive",
        })
        setCapacity(null)
        return
      }

      const capacityData = (response.data as any)?.data || response.data
      setCapacity(capacityData)
    } catch (error) {
      console.error("[FacilityCapacity] Error:", error)
      toast({
        title: t("common.error", language) || "Error",
        description: "Failed to fetch capacity",
        variant: "destructive",
      })
      setCapacity(null)
    } finally {
      setIsLoading(false)
    }
  }

  const availabilityPercentage = capacity
    ? Math.round((capacity.availableSlots / capacity.totalSlots) * 100)
    : 0

  const isLowCapacity = capacity && availabilityPercentage < 20
  const isFull = capacity && capacity.availableSlots === 0

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Facility Capacity
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="facilityId">
              Facility ID
            </Label>
            <Input
              id="facilityId"
              type="text"
              placeholder={user?.facility || "Enter facility ID"}
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="capacityDate">
              Date
            </Label>
            <Input
              id="capacityDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleCheckCapacity}
            disabled={isLoading || !facilityId}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("common.loading", language) || "Loading..."}
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Check Capacity
              </>
            )}
          </Button>
        </div>

        {capacity && (
          <div className="mt-6 space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Slots
              </span>
              <span className="font-semibold">{capacity.totalSlots}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Booked Slots
              </span>
              <span className="font-semibold">{capacity.bookedSlots}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Available Slots
              </span>
              <Badge
                variant={isFull ? "destructive" : isLowCapacity ? "secondary" : "default"}
                className={cn(
                  "font-semibold",
                  !isFull && !isLowCapacity && "bg-green-600"
                )}
              >
                {capacity.availableSlots}
              </Badge>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Availability
                </span>
                <span className="text-sm font-semibold">{availabilityPercentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    isFull
                      ? "bg-destructive"
                      : isLowCapacity
                      ? "bg-yellow-500"
                      : "bg-green-600"
                  )}
                  style={{ width: `${availabilityPercentage}%` }}
                />
              </div>
            </div>

            {isFull && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                  Facility is at full capacity for this date
                </span>
              </div>
            )}

            {isLowCapacity && !isFull && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">
                  Low availability - consider alternative dates
                </span>
              </div>
            )}

            {!isFull && !isLowCapacity && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  Good availability for this date
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
