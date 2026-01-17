"use client"

import { Card } from "@/components/ui/card"
import { AlertTriangle, Package, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useInventory } from "@/lib/inventory-context"

interface HealthWorkerInventoryPreviewProps {
  language: string
}

export function HealthWorkerInventoryPreview({ language }: HealthWorkerInventoryPreviewProps) {
  const { stock } = useInventory()
  const router = useRouter()

  // Calculate inventory statistics
  const adequateStock = stock.filter((v) => v.status === "adequate").length
  const lowStock = stock.filter((v) => v.status === "low").length
  const criticalStock = stock.filter((v) => v.status === "critical").length

  // Find expiring vaccines
  const expiringVaccines = stock.filter((v) => {
    const today = new Date()
    const expiry = new Date(v.expiryDate)
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  })

  const handleViewAll = () => {
    router.push("/dashboard/inventory")
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          {language === "am" ? "ክትባት ክምችት አጠቃላይ ሁኔታ" : "Vaccine Inventory Overview"}
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewAll}
          className="cursor-pointer hover:bg-muted active:bg-accent transition-colors"
        >
          {language === "am" ? "ሁሉንም ተመልከት" : "View All"}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-xs text-green-700 font-medium">{language === "am" ? "በቂ ክምችት" : "Adequate"}</p>
          <p className="text-2xl font-bold text-green-700">{adequateStock}</p>
        </div>

        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="text-xs text-yellow-700 font-medium">{language === "am" ? "ዝቅተኛ ክምችት" : "Low Stock"}</p>
          <p className="text-2xl font-bold text-yellow-700">{lowStock}</p>
        </div>

        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-700 font-medium">{language === "am" ? "ወሳኝ ክምችት" : "Critical"}</p>
          <p className="text-2xl font-bold text-red-700">{criticalStock}</p>
        </div>

        <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
          <p className="text-xs text-orange-700 font-medium">{language === "am" ? "ስቃት ላይ" : "Expiring"}</p>
          <p className="text-2xl font-bold text-orange-700">{expiringVaccines.length}</p>
        </div>
      </div>

      {/* Alerts for critical issues */}
      {(criticalStock > 0 || expiringVaccines.length > 0) && (
        <div className="space-y-2 pt-3 border-t border-border">
          {criticalStock > 0 && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">
                  {language === "am"
                    ? `${criticalStock} ክትባቶች ወሳኝ ክምችት ያስፈልጋቸዋል`
                    : `${criticalStock} vaccines need urgent restocking`}
                </p>
                <p className="text-xs text-red-600">
                  {language === "am" ? "ወዲያውኑ ይህንን ይመልከቱ" : "Attend to this immediately"}
                </p>
              </div>
            </div>
          )}

          {expiringVaccines.length > 0 && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-700">
                  {language === "am"
                    ? `${expiringVaccines.length} ክትባቶች በ 30 ቀናት ውስጥ ስቃት ላይ ይገባሉ`
                    : `${expiringVaccines.length} vaccines expiring within 30 days`}
                </p>
                <p className="text-xs text-orange-600">{language === "am" ? "ቅድሚያ ይሰጠው" : "Prioritize usage"}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {criticalStock === 0 && expiringVaccines.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
          <TrendingUp className="h-4 w-4" />
          <p>{language === "am" ? "ሁሉም ክትባቶች በደንብ ተቀምጠዋል" : "All vaccines are in good standing"}</p>
        </div>
      )}
    </Card>
  )
}
