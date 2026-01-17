"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useChildren } from "@/lib/children-context"
import { useUser } from "@/lib/user-context"
import { useLanguage } from "@/lib/language-context"

export function ParentViewChildren() {
  const { getChildrenByParent } = useChildren()
  const { user } = useUser()
  const { language } = useLanguage()

  const parentId = user?.id || "parent_1"
  const parentChildren = getChildrenByParent(parentId)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {language === "am" ? "የሚያመለክተዋት ልጆች" : "Your Children"}
        </h3>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parentChildren.map((child) => (
          <Card key={child.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-foreground">
                  {child.firstName} {child.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === "am" ? "የልደት ቀን" : "DOB"}: {new Date(child.dateOfBirth).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {language === "am" ? "ጾታ" : "Gender"}:{" "}
                  {child.gender === "male" ? (language === "am" ? "ወንድ" : "Male") : language === "am" ? "ሴት" : "Female"}
                </p>
              </div>

              <div className="bg-muted p-3 rounded text-sm">
                <p className="font-medium text-foreground mb-1">{language === "am" ? "የክትባት መታወቂያ" : "Vaccine ID"}</p>
                <p className="text-foreground font-mono">{child.vaccineId}</p>
              </div>

              <Link href={`/dashboard/children/${child.id}`}>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
                  {language === "am" ? "ዝርዝር መመልከት" : "View Details"}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {parentChildren.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            {language === "am" ? "ምንም ተመዝግቦ ዳግመኛ ላይ ያለ ልጅ የለም" : "No children registered yet"}
          </p>
        </Card>
      )}
    </div>
  )
}
