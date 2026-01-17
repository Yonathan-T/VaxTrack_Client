import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const epiSchedule = [
  {
    ageGroup: "At Birth",
    vaccines: [
      { name: "BCG", description: "Bacillus Calmette-Guérin (Tuberculosis)", dose: "Single dose" },
      { name: "OPV 0", description: "Oral Polio Vaccine (Birth dose)", dose: "0.1 ml" },
    ],
  },
  {
    ageGroup: "6 Weeks",
    vaccines: [
      { name: "Penta 1", description: "DPT-HepB-Hib (5-in-1)", dose: "0.5 ml IM" },
      { name: "OPV 1", description: "Oral Polio Vaccine", dose: "2 drops" },
      { name: "PCV 1", description: "Pneumococcal Conjugate Vaccine", dose: "0.5 ml IM" },
      { name: "Rota 1", description: "Rotavirus Vaccine", dose: "Oral" },
    ],
  },
  {
    ageGroup: "10 Weeks",
    vaccines: [
      { name: "Penta 2", description: "DPT-HepB-Hib (5-in-1)", dose: "0.5 ml IM" },
      { name: "OPV 2", description: "Oral Polio Vaccine", dose: "2 drops" },
      { name: "PCV 2", description: "Pneumococcal Conjugate Vaccine", dose: "0.5 ml IM" },
      { name: "Rota 2", description: "Rotavirus Vaccine", dose: "Oral" },
    ],
  },
  {
    ageGroup: "14 Weeks",
    vaccines: [
      { name: "Penta 3", description: "DPT-HepB-Hib (5-in-1)", dose: "0.5 ml IM" },
      { name: "OPV 3", description: "Oral Polio Vaccine", dose: "2 drops" },
      { name: "PCV 3", description: "Pneumococcal Conjugate Vaccine", dose: "0.5 ml IM" },
      { name: "IPV", description: "Inactivated Polio Vaccine", dose: "0.5 ml IM" },
    ],
  },
  {
    ageGroup: "9 Months",
    vaccines: [
      { name: "Measles 1", description: "Measles-Rubella Vaccine", dose: "0.5 ml SC" },
      { name: "Yellow Fever", description: "Yellow Fever Vaccine (if in endemic area)", dose: "0.5 ml SC" },
    ],
  },
  {
    ageGroup: "15 Months",
    vaccines: [{ name: "Measles 2", description: "Measles-Rubella Vaccine (Booster)", dose: "0.5 ml SC" }],
  },
]

export function EPISchedule() {
  return (
    <div className="space-y-6">
      <div className="bg-primary/5 p-4 rounded-lg">
        <h3 className="font-semibold text-foreground mb-2">Ethiopian Expanded Program on Immunization (EPI)</h3>
        <p className="text-sm text-muted-foreground">
          This schedule follows the national immunization guidelines for children in Ethiopia. All vaccines are provided
          free of charge at health facilities.
        </p>
      </div>

      <div className="space-y-4">
        {epiSchedule.map((schedule, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="default" className="text-sm">
                {schedule.ageGroup}
              </Badge>
              <h3 className="text-lg font-semibold text-foreground">{schedule.vaccines.length} Vaccines</h3>
            </div>

            <div className="space-y-3">
              {schedule.vaccines.map((vaccine, vIndex) => (
                <div key={vIndex} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{vaccine.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {vaccine.dose}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{vaccine.description}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold text-foreground mb-2">Important Notes:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Vaccines should be administered as close to the recommended age as possible</li>
          <li>If a child misses a dose, catch-up vaccination should be provided at the next visit</li>
          <li>All vaccines can be given simultaneously at different injection sites</li>
          <li>Maintain cold chain requirements for all vaccines</li>
          <li>Document all vaccinations with batch numbers and expiry dates</li>
        </ul>
      </div>
    </div>
  )
}
