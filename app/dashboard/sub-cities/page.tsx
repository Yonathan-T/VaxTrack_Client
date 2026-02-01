"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Users, MapPin, Eye, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { getSubCities, SubCity } from "@/lib/admin-api"

export default function SubCitiesPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [subCities, setSubCities] = useState<SubCity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSubCities()
  }, [])

  const fetchSubCities = async () => {
    try {
      setLoading(true)
      const response = await getSubCities()
      
      if (response.data?.success) {
        setSubCities(response.data.data || [])
      } else {
        throw new Error("Failed to fetch sub-cities")
      }
    } catch (err: any) {
      console.error("Error fetching sub-cities:", err)
      setError(err.message || "Failed to load sub-cities")
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: err.message || (language === "am" ? "ንዑስ ከተማዎችን ማምጣት አልተቻለም" : "Failed to load sub-cities"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (subCity: SubCity) => {
    // Store the sub-city data in session storage for the details page
    sessionStorage.setItem("selectedSubCity", JSON.stringify(subCity))
    router.push(`/dashboard/sub-cities/${subCity.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{language === "am" ? "በመስቀል ላይ..." : "Loading..."}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchSubCities}>
          {language === "am" ? "እንደገና ይሞክር" : "Try Again"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === "am" ? "ንዑስ ከተማዎች" : "Sub Cities"}
          </h1>
          <p className="text-muted-foreground">
            {language === "am" 
              ? "ስርዓቱ ውስጥ ያሉትን ንዑስ ከተማዎች ይመልከቱ እና ያስተዳድሩ" 
              : "View and manage sub-cities in the system"}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === "am" ? "ተመለስ" : "Back"}
        </Button>
      </div>

      {/* Sub Cities Grid */}
      {subCities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === "am" ? "ምንም ንዑስ ከተማዎች አልተገኙም" : "No sub-cities found"}
            </h3>
            <p className="text-muted-foreground">
              {language === "am" 
                ? "በስርዓቱ ውስጥ ምንም ንዑስ ከተማዎች አልተመዘገቡም" 
                : "No sub-cities have been registered in the system"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subCities.map((subCity) => (
            <Card key={subCity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{subCity.name}</CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {subCity.facilities_count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {language === "am" ? "ተቋማት" : "Facilities"}
                      </p>
                      <p className="text-2xl font-bold">{subCity.facilities_count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {language === "am" ? "ተጠቃሚዎች" : "Users"}
                      </p>
                      <p className="text-2xl font-bold">{subCity.users_count}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{language === "am" ? "አዲስ አበባ" : "Addis Ababa"}</span>
                </div>

                {/* Created Date */}
                <div className="text-xs text-muted-foreground">
                  {language === "am" ? "ተፈጥሯል" : "Created"}:{" "}
                  {new Date(subCity.created_at).toLocaleDateString(
                    language === "am" ? "am-ET" : "en-US"
                  )}
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full" 
                  onClick={() => handleViewDetails(subCity)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {language === "am" ? "ዝርዝሮችን ይመልከቱ" : "View Details"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
