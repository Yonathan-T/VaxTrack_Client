"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, User } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { EditChildModal } from "./edit-child-modal"
import { useChildren } from "@/lib/children-context"

export function ChildProfile({ childId }: { childId: string }) {
  const { language } = useLanguage()
  const { children } = useChildren()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const child = children.find((c) => c.id === childId)

  if (!child) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">{t("children.noChildrenFound", language)}</p>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {child.firstName} {child.middleName} {child.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{child.dateOfBirth}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            {t("dashboard.actions.edit", language)}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t("form.childInformation", language)}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("form.dateOfBirth", language)}</span>
                <span className="font-medium text-foreground">{child.dateOfBirth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("children.gender", language)}</span>
                <span className="font-medium text-foreground capitalize">{child.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Birth Weight</span>
                <span className="font-medium text-foreground">{child.birthWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Place of Birth</span>
                <span className="font-medium text-foreground">{child.placeOfBirth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("children.status", language)}</span>
                <Badge variant="default">{t("children.upToDate", language)}</Badge>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">{t("form.guardianInformation", language)}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("form.guardianName", language)}</span>
                <span className="font-medium text-foreground">
                  {child.guardianFirstName} {child.guardianLastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Relationship</span>
                <span className="font-medium text-foreground capitalize">{child.relationship}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("children.phone", language)}</span>
                <span className="font-medium text-foreground">{child.guardianPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{child.guardianEmail}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">{t("form.addressInformation", language)}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kebele</span>
                <span className="font-medium text-foreground">{child.kebele}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Woreda</span>
                <span className="font-medium text-foreground">{child.woreda}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">House Number</span>
                <span className="font-medium text-foreground">{child.houseNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <EditChildModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} child={child} />
    </>
  )
}
