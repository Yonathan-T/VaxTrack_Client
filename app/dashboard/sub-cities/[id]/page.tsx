"use client"

import { useState, useEffect, use } from "react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Users, MapPin, Phone, Clock, ArrowLeft, Calendar, Globe, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { getSubCities, SubCity } from "@/lib/admin-api"

export default function SubCityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { language } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [subCity, setSubCity] = useState<SubCity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSubCityDetails()
  }, [id])

  const fetchSubCityDetails = () => {
    try {
      setLoading(true)
      
      // Try to get data from session storage first (from the list page)
      const storedData = sessionStorage.getItem("selectedSubCity")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        if (parsedData.id === parseInt(id)) {
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
      
      
      // Handle different response structures
      let subCitiesData: SubCity[] = []
      if (response.data?.success) {
        subCitiesData = response.data.data || []
      } else if (response.data && Array.isArray(response.data)) {
        subCitiesData = response.data as SubCity[]
      }
      
      
      const foundSubCity = subCitiesData.find((city: SubCity) => city.id === parseInt(id))
      
      if (foundSubCity) {
        setSubCity(foundSubCity)
      } else {
        throw new Error("Sub-city not found")
      }
    } catch (err: any) {
      console.error("Error fetching sub-city details:", err)
      setError(err.message || "Failed to load sub-city details")
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: err.message || (language === "am" ? "ንዑስ ከተማውን መመልከት አልተቻለም" : "Failed to load sub-city details"),
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
              {language === "am" ? "ንዑስ ከተማ ዝርዝሮች እና ተቋማት" : "Sub-city details and facilities"}
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
                <p className="text-3xl font-bold">{subCity.total_users_count}</p>
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
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "am" ? "አድራሻ" : "Location"}
                </p>
                <p className="text-sm font-bold">
                  {subCity.address || (language === "am" ? "አልተገለጸም" : "N/A")}
                </p>
                {subCity.google_maps_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-xs"
                    onClick={() => window.open(subCity.google_maps_url!, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {language === "am" ? "ካርታ ይመልከቱ" : "View Map"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coordinates Card */}
        {(subCity.latitude || subCity.longitude) && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Globe className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === "am" ? "መገኛው" : "Coordinates"}
                  </p>
                  <p className="text-sm font-bold">
                    {subCity.latitude && subCity.longitude 
                      ? `${subCity.latitude}, ${subCity.longitude}`
                      : subCity.latitude || subCity.longitude || (language === "am" ? "N/A" : "N/A")
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Facilities List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {language === "am" ? "ተቋማት" : "Facilities"}
        </h2>
        
        {(!subCity.facilities || subCity.facilities.length === 0) ? (
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
          <div className="grid gap-6 md:grid-cols-2">
            {subCity.facilities?.map((facility) => (
              <Card 
                key={facility.id} 
                className="group relative overflow-hidden border hover:border-green-200/50 dark:hover:border-green-800/30 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header with icon */}
                <CardHeader className="relative pb-4 border-b border-gray-100/50 dark:border-gray-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      <Building className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {facility.name}
                      </h3>
                      <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 group-hover:border-green-200 dark:group-hover:border-green-800 transition-colors">
                        {facility.registration_code}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  {/* Location Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      <MapPin className="h-4 w-4" />
                      {language === "am" ? "አካባቢ" : "Location"}
                    </div>
                    <div className="space-y-2 pl-6">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-green-500 transition-colors" />
                        <span>{facility.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-green-500 transition-colors" />
                        <span>{facility.address}</span>
                      </div>
                      {facility.woreda && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-green-500 transition-colors" />
                          <span>
                            {language === "am" ? "ወረዳ" : "Woreda"}: {facility.woreda}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact & Hours Section */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Contact */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        <Phone className="h-4 w-4" />
                        {language === "am" ? "ስልክ" : "Contact"}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 pl-6">
                        {facility.phone}
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        <Clock className="h-4 w-4" />
                        {language === "am" ? "ሰዓታት" : "Hours"}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 pl-6">
                        {facility.opens_at?.slice(0, 5)} - {facility.closes_at?.slice(0, 5)}
                      </div>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100/50 dark:border-gray-800/30">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      <Users className="h-4 w-4" />
                      {language === "am" ? "የዕለታዊ አቅም" : "Daily Capacity"}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {facility.daily_capacity}
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
