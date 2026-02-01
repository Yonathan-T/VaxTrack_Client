"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Users, MapPin, Phone, Clock, ArrowLeft, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { getSubCities, SubCity } from "@/lib/admin-api"

export default function SubCityDetailsPage({ params }: { params: { id: string } }) {
  const { language } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [subCity, setSubCity] = useState<SubCity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSubCityDetails()
  }, [params.id])

  const fetchSubCityDetails = () => {
    try {
      setLoading(true)
      
      // Try to get data from session storage first (from the list page)
      const storedData = sessionStorage.getItem("selectedSubCity")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        if (parsedData.id === parseInt(params.id)) {
          setSubCity(parsedData)
          setLoading(false)
          return
        }
      }

      // If not in storage or ID doesn't match, fetch from API
      fetchSubCityFromAPI()
    } catch (err: any) {
      console.error("Error loading sub-city details:", err)
      setError(err.message || "Failed to load sub-city details")
      setLoading(false)
    }
  }

  const fetchSubCityFromAPI = async () => {
    try {
      const response = await getSubCities()
      
      if (response.data?.success) {
        const foundSubCity = response.data.data?.find((city: SubCity) => city.id === parseInt(params.id))
        if (foundSubCity) {
          setSubCity(foundSubCity)
        } else {
          throw new Error("Sub-city not found")
        }
      } else {
        throw new Error("Failed to fetch sub-city details")
      }
    } catch (err: any) {
      console.error("Error fetching sub-city details:", err)
      setError(err.message || "Failed to load sub-city details")
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: err.message || (language === "am" ? "የንዑስ ከተማ ዝርዝሮችን ማምጣት አልተቻለም" : "Failed to load sub-city details"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{language === "am" ? "በመስቀል ላይ..." : "Loading..."}</span>
      </div>
    )
  }

  if (error || !subCity) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error || (language === "am" ? "ንዑስ ከተማው አልተገኘም" : "Sub-city not found")}</div>
        <Button onClick={() => router.push("/dashboard/sub-cities")}>
          {language === "am" ? "ወደ ንዑስ ከተማዎች ተመለስ" : "Back to Sub Cities"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/sub-cities")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "am" ? "ተመለስ" : "Back"}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{subCity.name}</h1>
            <p className="text-muted-foreground">
              {language === "am" ? "የንዑስ ከተማ ዝርዝሮች እና ተቋማት" : "Sub-city details and facilities"}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-city Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "am" ? "ጠቅላላ ተቋማት" : "Total Facilities"}
                </p>
                <p className="text-3xl font-bold">{subCity.facilities_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "am" ? "ጠቅላላ ተጠቃሚዎች" : "Total Users"}
                </p>
                <p className="text-3xl font-bold">{subCity.users_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "am" ? "የተፈጥሯል" : "Created"}
                </p>
                <p className="text-sm font-bold">
                  {new Date(subCity.created_at).toLocaleDateString(
                    language === "am" ? "am-ET" : "en-US"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "am" ? "አካባቢ" : "Location"}
                </p>
                <p className="text-sm font-bold">
                  {language === "am" ? "አዲስ አበባ" : "Addis Ababa"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facilities List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {language === "am" ? "ተቋማት" : "Facilities"}
        </h2>
        
        {subCity.facilities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === "am" ? "ምንም ተቋማት አልተገኙም" : "No facilities found"}
              </h3>
              <p className="text-muted-foreground">
                {language === "am" 
                  ? "በዚህ ንዑስ ከተማ ውስጥ ምንም ተቋማት አልተመዘገቡም" 
                  : "No facilities have been registered in this sub-city"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {subCity.facilities.map((facility) => (
              <Card key={facility.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{facility.name}</h3>
                        <Badge variant="outline">{facility.registration_code}</Badge>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        {/* Location Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{facility.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{facility.address}</span>
                          </div>
                          {facility.woreda && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {language === "am" ? "ወረዳ" : "Woreda"}: {facility.woreda}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Contact & Schedule Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{facility.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {facility.opens_at} - {facility.closes_at}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {language === "am" ? "የዕለታዊ አቅም" : "Daily Capacity"}: {facility.daily_capacity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
