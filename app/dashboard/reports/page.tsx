"use client"

import { useEffect, useState } from "react"
import { CoverageReport } from "@/components/reports/coverage-report"
import { TrendAnalysis } from "@/components/reports/trend-analysis"
import { DefaulterReport } from "@/components/reports/defaulter-report"
import { GeographicReport } from "@/components/reports/geographic-report"
import { Button } from "@/components/ui/button"
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
import { RoleProtected } from "@/lib/role-protected"
import { getAllChildrenForAdmin, getUsers, getAnalyticsReport, downloadReport } from "@/lib/admin-api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ReportsPage() {
  const { language } = useLanguage()
  const { toast } = useToast()

  const [stats, setStats] = useState({
    users: 0,
    children: 0,
    vaccinations: 0,
  })
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const [usersRes, childrenRes, analyticsRes] = await Promise.all([
          getUsers(),
          getAllChildrenForAdmin(),
          getAnalyticsReport(),
        ])

        const payload: any = usersRes.data
        const usersCount =
          (Array.isArray(payload) && payload.length) ||
          (Array.isArray(payload?.users) && payload.users.length) ||
          (Array.isArray(payload?.data) && payload.data.length) ||
          0

        const cPayload: any = childrenRes.data
        const childrenCount =
          (Array.isArray(cPayload) && cPayload.length) ||
          (Array.isArray(cPayload?.children) && cPayload.children.length) ||
          (Array.isArray(cPayload?.data) && cPayload.data.length) ||
          0

        // Estimate total vaccinations from trends if available, else 0
        const trends = (analyticsRes.data as any)?.trends || []
        const vacCount = trends.reduce((acc: number, curr: any) => {
          // Sum all granular vaccine keys
          const keys = [
            'bcg', 'opv0', 'penta1', 'pcv1', 'rota1', 'opv1',
            'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3',
            'opv3', 'ipv', 'measles1', 'measles2',
            'tt1', 'tt2', 'tt3', 'tt4', 'tt5'
          ]
          const monthlyTotal = keys.reduce((mAcc, key) => mAcc + (Number(curr[key]) || 0), 0)
          return acc + monthlyTotal
        }, 0)

        setStats({
          users: usersCount,
          children: childrenCount,
          vaccinations: vacCount,
        })

        if (analyticsRes.data) {
          setAnalyticsData(analyticsRes.data)
        }
      } catch (err) {
        console.error("Failed to fetch reports data:", err)
        toast({
          title: "Error",
          description: "Failed to load reports data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const handleDownload = async (reportType: "coverage" | "overdue_summary" | "user_list", format: "csv" | "pdf") => {
    try {
      toast({
        title: language === "am" ? "ወደ ውጭ በመላክ ላይ..." : "Exporting...",
        description: language === "am" ? "ሪፖርቱን እያዘጋጀን ነው..." : "Preparing your report...",
      })

      const { url, token } = await downloadReport(reportType, format)

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: language === "am" ? "ተሳክቷል" : "Success",
        description: language === "am" ? "ሪፖርቱ በተሳካ ሁኔታ ወርዷል" : "Report downloaded successfully",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ሪፖርቱን ማውረድ አልተቻለም" : "Failed to download report",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <RoleProtected allowedRoles={["woreda_officer", "admin", "system_administrator", "super_admin", "healthcare_worker", "health_official"]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </RoleProtected>
    )
  }

  return (
    <RoleProtected allowedRoles={["woreda_officer", "admin", "system_administrator", "super_admin", "healthcare_worker", "health_official"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("reports.title", language)}</h1>
            <p className="text-muted-foreground">{t("reports.subtitle", language)}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                {t("reports.exportReport", language)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{language === "am" ? "የሪፖርት አይነት" : "Report Type"}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="p-2 text-xs font-semibold text-muted-foreground">
                {language === "am" ? "የሽፋን ሪፖርት" : "Coverage Report"}
              </div>
              <DropdownMenuItem onClick={() => handleDownload("coverage", "csv")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("coverage", "pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>PDF</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <div className="p-2 text-xs font-semibold text-muted-foreground">
                {language === "am" ? "ያልተከተቡ ልጆች ማጠቃለያ" : "Overdue Summary"}
              </div>
              <DropdownMenuItem onClick={() => handleDownload("overdue_summary", "csv")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("overdue_summary", "pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>PDF</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <div className="p-2 text-xs font-semibold text-muted-foreground">
                {language === "am" ? "የተጠቃሚዎች ዝርዝር" : "User List"}
              </div>
              <DropdownMenuItem onClick={() => handleDownload("user_list", "csv")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("user_list", "pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>


        <CoverageReport />

        <div className="grid lg:grid-cols-2 gap-6">
          <TrendAnalysis data={analyticsData?.trends || []} />
          <DefaulterReport data={analyticsData?.defaulters || []} />
        </div>

        <GeographicReport data={analyticsData?.geographic || []} />
      </div>
    </RoleProtected>
  )
}
