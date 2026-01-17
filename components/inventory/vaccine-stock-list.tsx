"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Edit, TrendingUp, TrendingDown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { UpdateStockModal } from "./update-stock-modal"
import { useInventory, type VaccineStock } from "@/lib/inventory-context"

export function VaccineStockList() {
  const { language } = useLanguage()
  const { stock } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVaccine, setSelectedVaccine] = useState<VaccineStock | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredStock = stock.filter((vaccine) => vaccine.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getStockPercentage = (quantity: number, minStock: number) => {
    return Math.min((quantity / minStock) * 100, 100)
  }

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30
  }

  const handleUpdate = (vaccine: VaccineStock) => {
    setSelectedVaccine(vaccine)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">{t("inventory.vaccineStockLevels", language)}</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("inventory.searchVaccines", language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredStock.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No vaccine stock found. Add stock to get started.</p>
            </div>
          ) : (
            filteredStock.map((vaccine) => {
              const stockPercentage = getStockPercentage(vaccine.quantity, vaccine.minStock)
              const expiringSoon = isExpiringSoon(vaccine.expiryDate)

              return (
                <div key={vaccine.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground">{vaccine.name}</h4>
                        <Badge
                          variant={
                            vaccine.status === "adequate"
                              ? "default"
                              : vaccine.status === "low"
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {vaccine.status === "adequate"
                            ? t("inventory.adequate", language)
                            : vaccine.status === "low"
                              ? t("inventory.lowStock", language)
                              : t("inventory.critical", language)}
                        </Badge>
                        {expiringSoon && (
                          <Badge variant="destructive" className="text-xs">
                            {t("inventory.expiringSoon", language)}
                          </Badge>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">{t("inventory.batchNumber", language)}</p>
                          <p className="font-medium text-foreground">{vaccine.batchNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("inventory.quantity", language)}</p>
                          <p className="font-medium text-foreground">
                            {vaccine.quantity} / {vaccine.minStock} {t("inventory.min", language)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("form.expiryDate", language)}</p>
                          <p className="font-medium text-foreground">{vaccine.expiryDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("inventory.manufacturer", language)}</p>
                          <p className="font-medium text-foreground">{vaccine.manufacturer}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{t("inventory.stockLevel", language)}</span>
                          <span className="font-medium text-foreground">{stockPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress
                          value={stockPercentage}
                          className={cn(
                            "h-2",
                            vaccine.status === "adequate"
                              ? "[&>div]:bg-secondary"
                              : vaccine.status === "low"
                                ? "[&>div]:bg-accent"
                                : "[&>div]:bg-destructive",
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          {vaccine.consumption > 100 ? (
                            <TrendingUp className="h-3 w-3 text-destructive" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-secondary" />
                          )}
                          <span className="text-muted-foreground">
                            {t("inventory.consumption", language)}:{" "}
                            <span className="font-medium text-foreground">{vaccine.consumption}/month</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => handleUpdate(vaccine)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t("dashboard.actions.edit", language)}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      {selectedVaccine && (
        <UpdateStockModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedVaccine(null)
          }}
          vaccine={selectedVaccine}
        />
      )}
    </>
  )
}
