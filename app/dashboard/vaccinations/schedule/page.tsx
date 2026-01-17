import { EPISchedule } from "@/components/vaccinations/epi-schedule"
import { Card } from "@/components/ui/card"

export default function VaccinationSchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ethiopian EPI Vaccination Schedule</h1>
        <p className="text-muted-foreground">Standard immunization schedule for children in Ethiopia</p>
      </div>

      <Card className="p-6">
        <EPISchedule />
      </Card>
    </div>
  )
}
