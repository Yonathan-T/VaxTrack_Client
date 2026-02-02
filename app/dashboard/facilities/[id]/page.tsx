"use client"

import { useState, useEffect, use } from "react"
import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Users, MapPin, Phone, Clock, ArrowLeft, Calendar, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { getFacility } from "@/lib/official-api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface FacilityUser {
  id: number
  name: string
  email: string
  role: string
  phone: string
  created_at: string
}

interface FacilityDetails {
  id: string | number
  name: string
  location: string
  phone: string
  address?: string
  woreda?: string | null
  registration_code?: string
  daily_capacity: number
  num_nurses?: number | null
  opens_at?: string
  closes_at?: string
  lunch_starts_at?: string
  lunch_ends_at?: string
  sub_city_id?: string | number | null
  users: FacilityUser[]
  created_at?: string
  updated_at?: string
}

export default function FacilityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { language } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [facility, setFacility] = useState<FacilityDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchFacilityDetails()
  }, [id])

  const fetchFacilityDetails = async () => {
    try {
      setLoading(true)
      const response = await getFacility(id)
      
      if (response.data) {
        setFacility(response.data as unknown as FacilityDetails)
      } else {
        throw new Error("Failed to fetch facility details")
      }
    } catch (err: any) {
      console.error("Error fetching facility details:", err)
      setError(err.message || "Failed to load facility details")
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: err.message || (language === "am" ? "ተቋም ዝርዝሮችን ማምጣት አልተቻለም" : "Failed to load facility details"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/facilities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "am" ? "ተመለስ" : "Back"}
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={fetchFacilityDetails}>
            {language === "am" ? "እንደገና ይሞክር" : "Try Again"}
          </Button>
        </div>
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/das  hboard/facilities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "am" ? "ተመለስ" : "Back"}
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/dashboard/facilities')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === "am" ? "ተመለስ" : "Back"}
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{facility.name}</h1>
          <p className="text-muted-foreground">
            {language === "am" ? "ተቋም ዝርዝሮች እና ዝርዝርት" : "Facility details and users"}
          </p>
        </div>
      </div>

      {/* Facility Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "am" ? "የምዝግብ ኮድ" : "Reg. Code"}
                </p>
                <p className="text-lg font-bold">{facility.registration_code}</p>
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
                  {language === "am" ? "የዕለታዊ አቅም" : "Daily Capacity"}
                </p>
                <p className="text-3xl font-bold">{facility.daily_capacity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "am" ? "ነሲዎች" : "Nurses"}
                </p>
                <p className="text-3xl font-bold">{facility.num_nurses || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "am" ? "ጠቅላላ ተጠቃሚዎች" : "Total Users"}
                </p>
                <p className="text-3xl font-bold">{facility.users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facility Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {language === "am" ? "አካባቢ መረጃ" : "Location Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {language === "am" ? "አድራሻ" : "Address"}
              </p>
              <p className="font-semibold">{facility.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {language === "am" ? "��ካባቢ" : "Location"}
              </p>
              <p className="font-semibold">{facility.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {language === "am" ? "ወረዳ" : "Woreda"}
              </p>
              <p className="font-semibold">{facility.woreda || (language === "am" ? "አልተገለጸም" : "N/A")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {language === "am" ? "የስራ ሰዓቶች" : "Working Hours"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {language === "am" ? "የመክፈቻ ሰዓት" : "Opening Hours"}
              </p>
              <p className="font-semibold">
                {facility.opens_at ? facility.opens_at.substring(0, 5) : 'N/A'} - 
                {facility.closes_at ? facility.closes_at.substring(0, 5) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {language === "am" ? "��ምሳር ጊዜ" : "Lunch Break"}
              </p>
              <p className="font-semibold">
                {facility.lunch_starts_at ? facility.lunch_starts_at.substring(0, 5) : 'N/A'} - 
                {facility.lunch_ends_at ? facility.lunch_ends_at.substring(0, 5) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {language === "am" ? "ስልክ" : "Phone"}
              </p>
              <p className="font-semibold">{facility.phone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {language === "am" ? "ተጠቃሚዎች" : "Users"} ({facility.users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "am" ? "ስም" : "Name"}</TableHead>
                <TableHead>{language === "am" ? "ኢሜይል" : "Email"}</TableHead>
                <TableHead>{language === "am" ? "�ርዕክክ" : "Role"}</TableHead>
                <TableHead>{language === "am" ? "ስልክ" : "Phone"}</TableHead>
                <TableHead>{language === "am" ? "የተፈጠረበበት" : "Created"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facility.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {user.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
