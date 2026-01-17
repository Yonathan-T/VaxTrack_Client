import { Card } from "@/components/ui/card"
import { Server, HardDrive, AlertCircle, Shield, Zap, Wrench, Download } from "lucide-react"
import Link from "next/link"

interface RoleDashboardProps {
  language: string
}

export function SystemAdministratorDashboard({ language }: RoleDashboardProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          {language === "am" ? "ስርዓት አስተዳዳሪ ዳሽቦርድ" : "System Administrator Dashboard"}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {language === "am" ? "ቴክኒካል ገጽታዎች ያስተዳድሩ" : "Manage technical aspects of the system"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {language === "am" ? "ስርዓት ሁኔታ" : "System Status"}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2">99.9%</p>
              <p className="text-xs text-green-600 mt-1">Uptime</p>
            </div>
            <Server className="h-8 sm:h-10 w-8 sm:w-10 text-primary opacity-50 flex-shrink-0" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {language === "am" ? "ማህደር አጠቃቀም" : "Memory Usage"}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2">64%</p>
              <p className="text-xs text-muted-foreground mt-1">Of available</p>
            </div>
            <Zap className="h-8 sm:h-10 w-8 sm:w-10 text-secondary opacity-50 flex-shrink-0" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {language === "am" ? "ስርዓት ማንቂያዎች" : "System Alerts"}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2">0</p>
              <p className="text-xs text-green-600 mt-1">Critical issues</p>
            </div>
            <AlertCircle className="h-8 sm:h-10 w-8 sm:w-10 text-green-600 opacity-50 flex-shrink-0" />
          </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">
          {language === "am" ? "ስርዓት አስተዳዳሪ ተግባራት" : "System Administrator Functions"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/dashboard/settings?tab=system"
            className="p-3 sm:p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition"
          >
            <div className="flex items-start gap-3">
              <Server className="h-4 sm:h-5 w-4 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-medium text-foreground">
                  {language === "am" ? "ቴክኒካል ገጽታዎች ያስተዳድሩ" : "Manages technical aspects"}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {language === "am" ? "ስርዓት ቅንብሮች እና ቴክኒካል ውቅር" : "System configuration and technical setup"}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/settings?tab=backups"
            className="p-3 sm:p-4 border border-border rounded-lg hover:bg-muted transition"
          >
            <div className="flex items-start gap-3">
              <HardDrive className="h-4 sm:h-5 w-4 sm:w-5 text-secondary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-medium text-foreground">
                  {language === "am" ? "ስርዓት ምትኅ ማስኬድ" : "Performs backups"}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {language === "am" ? "የውሂብ መሸጋገሪያ እና ወደ ኋላ ማገገሚያ" : "Data backups and recovery management"}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/settings?tab=troubleshooting"
            className="p-3 sm:p-4 border border-border rounded-lg hover:bg-muted transition"
          >
            <div className="flex items-start gap-3">
              <Wrench className="h-4 sm:h-5 w-4 sm:w-5 text-accent mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-medium text-foreground">
                  {language === "am" ? "ችግራት ፈታ" : "Troubleshoots issues"}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {language === "am" ? "ስርዓት ችግራት ምርመራ እና ፍታት" : "Diagnose and resolve system problems"}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/settings?tab=updates"
            className="p-3 sm:p-4 border border-border rounded-lg hover:bg-muted transition"
          >
            <div className="flex items-start gap-3">
              <Download className="h-4 sm:h-5 w-4 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-medium text-foreground">
                  {language === "am" ? "ስርዓት ማሻሻል" : "Updates system"}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {language === "am" ? "ስርዓት ማሻሻሊያ እና ጥገና" : "System updates and maintenance"}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 border-primary/20">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
          {language === "am" ? "ስርዓት ደህንነት" : "System Security"}
        </h3>
        <div className="flex items-start gap-3 sm:gap-4">
          <Shield className="h-5 sm:h-6 w-5 sm:w-6 text-primary mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground mb-2">
              {language === "am" ? "ደህንነት ሁኔታ: ጠንከር" : "Security Status: Secure"}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {language === "am"
                ? "ሁሉም ደህንነት ደንቦች እና ውቅሮች ታንቦ አሉ"
                : "All security protocols and configurations are active"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
