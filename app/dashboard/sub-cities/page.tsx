"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Users, MapPin, Eye, ArrowLeft, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { getSubCities, SubCity } from "@/lib/admin-api"
import { AddSubcityModal } from "@/components/admin/add-subcity-modal"

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
      
      console.log("[SubCitiesPage] API response:", response)
      
      // Handle different response structures
      let subCitiesData: SubCity[] = []
      if (response.data?.success) {
        subCitiesData = response.data.data || []
      } else if (response.data && Array.isArray(response.data)) {
        subCitiesData = response.data as SubCity[]
      }
      
      console.log("[SubCitiesPage] Extracted sub-cities:", subCitiesData)
      
      if (subCitiesData.length > 0) {
        setSubCities(subCitiesData)
      } else {
        console.log("[SubCitiesPage] No sub-cities found")
        setSubCities([])
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
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "am" ? "ተመለስ" : "Back"}
          </Button>
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
        </div>
        <AddSubcityModal onSuccess={() => {
          // Refresh the sub-cities list after successful creation
          fetchSubCities()
        }}>
          <Button className="bg-green-600/80 hover:bg-green-600/90 text-white border-green-600/20">
            <Plus className="h-4 w-4 mr-2" />
            {language === "am" ? "ንዑስ ከተማ ይጨምሩ" : "Add Subcity"}
          </Button>
        </AddSubcityModal>
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
            <Card 
              key={subCity.id} 
              className="group relative overflow-hidden border hover:border-green-200/50 dark:hover:border-green-800/30 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              onClick={() => handleViewDetails(subCity)}
            >
              {/* Header */}
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {subCity.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {language === "am" ? "ንዑስ ከተማ" : "Sub City"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
                    {language === "am" ? "መለያ" : "ID"}: {subCity.id}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="relative p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group/b stat-card">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/20 border border-gray-200/50 dark:border-gray-800/30 group-hover/b:bg-green-50/50 dark:group-hover/b:bg-green-900/20 group-hover/b:border-green-200/50 dark:group-hover/b:border-green-800/30 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-gray-500 group-hover/b:bg-green-500 flex items-center justify-center text-white transition-colors">
                        <Building className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover/b:text-green-600 dark:group-hover/b:text-green-400 transition-colors uppercase tracking-wide">
                          {language === "am" ? "ተቋማት" : "Facilities"}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {subCity.facilities_count}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group/b stat-card">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/20 border border-gray-200/50 dark:border-gray-800/30 group-hover/b:bg-green-50/50 dark:group-hover/b:bg-green-900/20 group-hover/b:border-green-200/50 dark:group-hover/b:border-green-800/30 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 group-hover/b:bg-green-500 flex items-center justify-center text-white transition-colors">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover/b:text-green-600 dark:group-hover/b:text-green-400 transition-colors uppercase tracking-wide">
                          {language === "am" ? "ጠቅላላ ተጠቃሚዎች" : "Total Users"}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {subCity.total_users_count}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group/b stat-card">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/20 border border-gray-200/50 dark:border-gray-800/30 group-hover/b:bg-green-50/50 dark:group-hover/b:bg-green-900/20 group-hover/b:border-green-200/50 dark:group-hover/b:border-green-800/30 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-purple-500 group-hover/b:bg-green-500 flex items-center justify-center text-white transition-colors">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover/b:text-green-600 dark:group-hover/b:text-green-400 transition-colors uppercase tracking-wide">
                          {language === "am" ? "ህፃናት" : "Children"}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {subCity.children_count}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group/b stat-card">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/20 border border-gray-200/50 dark:border-gray-800/30 group-hover/b:bg-green-50/50 dark:group-hover/b:bg-green-900/20 group-hover/b:border-green-200/50 dark:group-hover/b:border-green-800/30 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-orange-500 group-hover/b:bg-green-500 flex items-center justify-center text-white transition-colors">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover/b:text-green-600 dark:group-hover/b:text-green-400 transition-colors uppercase tracking-wide">
                          {language === "am" ? "ወላጆች" : "Parents"}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {subCity.parents_count}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    <MapPin className="h-3 w-3" />
                    {language === "am" ? "ዝርዝር እይሳት" : "View details"}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                    <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
