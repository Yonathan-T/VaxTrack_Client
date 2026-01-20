"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, User, Mail, Phone, MapPin, Calendar, Building2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { EditChildModal } from "./edit-child-modal"
import { getChildProfile, type ChildProfile } from "@/lib/healthcare-worker-api"
import { useToast } from "@/hooks/use-toast"

export function ChildProfile({ childId }: { childId: string }) {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [child, setChild] = useState<ChildProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        setIsLoading(true)
        const response = await getChildProfile(childId)

        if (response.error) {
          toast({
            title: t("common.error" as any, language) || "Error",
            description: response.error.message || "Failed to load child details",
            variant: "destructive",
          })
          return
        }

        if (response.data) {
          const childData = response.data as any
          setChild(childData)
        }
      } catch (error) {
        console.error("[ChildProfile] Error:", error)
        toast({
          title: t("common.error" as any, language) || "Error",
          description: "Failed to load child details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchChildData()
  }, [childId, language, toast])

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="space-y-2 w-full max-w-md">
            <div className="h-8 bg-muted animate-pulse rounded-md" />
            <div className="h-4 bg-muted animate-pulse rounded-md w-3/4 mx-auto" />
          </div>
        </div>
      </Card>
    )
  }

  if (!child) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">{t("children.noChildrenFound", language) || "Child not found"}</p>
      </Card>
    )
  }

  const fullName = `${child.first_name} ${child.last_name}`.trim()
  const dob = child.date_of_birth
    ? new Date(child.date_of_birth).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-"
  const formatAge = (dobStr?: string) => {
    if (!dobStr) return null
    const birth = new Date(dobStr)
    const now = new Date()
    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    const days = now.getDate() - birth.getDate()
    if (days < 0) months -= 1
    if (months < 0) {
      years -= 1
      months += 12
    }
    if (years <= 0) return `${Math.max(0, months)} months old`
    return `${years} ${years === 1 ? "year" : "years"} old`
  }
  const ageText = formatAge(child.date_of_birth || (child as any)?.dateOfBirth)

  return (
    <>
      <Card className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{fullName}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {dob}
                </div>
                {ageText && <div>{ageText}</div>}
              </div>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            {t("dashboard.actions.edit", language) || "Edit"}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Child Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("form.childInformation", language) || "Child Information"}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Child ID</span>
                <span className="font-mono font-semibold text-primary">#{child.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">{t("form.dateOfBirth", language) || "Date of Birth"}</span>
                <span className="font-medium text-foreground">{dob}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">{t("children.gender", language) || "Gender"}</span>
                <Badge variant="outline" className="capitalize">
                  {child.sex || "-"}
                </Badge>
              </div>
              {child.national_id && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">National ID</span>
                  <span className="font-medium text-foreground font-mono">{child.national_id}</span>
                </div>
              )}
              {child.address && (
                <div className="flex justify-between items-start py-2 border-b border-border/50">
                  <span className="text-muted-foreground flex items-start gap-1">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    Address
                  </span>
                  <span className="font-medium text-foreground text-right max-w-[60%]">{child.address}</span>
                </div>
              )}
              {child.facility && (
                <div className="flex justify-between items-start py-2 border-b border-border/50">
                  <span className="text-muted-foreground flex items-start gap-1">
                    <Building2 className="h-4 w-4 mt-0.5" />
                    Facility
                  </span>
                  <div className="text-right max-w-[60%]">
                    <div className="font-medium text-foreground">{child.facility.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{child.facility.location}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("form.guardianInformation", language) || "Parent/Guardian Information"}
            </h3>
            {child.parent ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{t("form.guardianName", language) || "Name"}</span>
                  <span className="font-medium text-foreground">{child.parent.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </span>
                  <a
                    href={`mailto:${child.parent.email}`}
                    className="font-medium text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {child.parent.email}
                  </a>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {t("children.phone", language) || "Phone"}
                  </span>
                  <a
                    href={`tel:${child.parent.phone}`}
                    className="font-medium text-primary hover:underline font-mono"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {child.parent.phone}
                  </a>
                </div>
                {child.user_id && (
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="font-medium text-foreground font-mono">#{child.user_id}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-4">
                {child.user_id ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span>Loading parent information...</span>
                  </div>
                ) : (
                  <span>No parent information available</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Registration Info */}
        {child.created_at && (
          <div className="border-t border-border pt-4">
            <div className="text-xs text-muted-foreground">
              Registered on {new Date(child.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        )}
      </Card>

      {child && <EditChildModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} child={child as any} />}
    </>
  )
}

