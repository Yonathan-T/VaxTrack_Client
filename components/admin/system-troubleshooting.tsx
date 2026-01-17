"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Activity } from "lucide-react"

interface Issue {
  id: string
  title: string
  status: "resolved" | "investigating" | "pending"
  severity: "low" | "medium" | "high"
  description: string
  solution: string
}

export function SystemTroubleshooting() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [isViewingLogs, setIsViewingLogs] = useState(false)
  const [isExecutingAction, setIsExecutingAction] = useState(false)
  const [issueLogs, setIssueLogs] = useState<string | null>(null)

  const [issues, setIssues] = useState<Issue[]>([
    {
      id: "api-latency",
      title: language === "am" ? "API ዘግየት" : "API Latency",
      status: "resolved",
      severity: "medium",
      description: language === "am" ? "API ምላሾች ደረቅ" : "API responses are slow",
      solution: language === "am" ? "ክንሚ ሊዋጀ እና ዳታቤዝ መጠየቂያ ተመቻቷል" : "Optimized cache and database queries",
    },
    {
      id: "memory-leak",
      title: language === "am" ? "Memory Leak" : "Memory Leak",
      status: "investigating",
      severity: "high",
      description: language === "am" ? "ማናት ሌሎችንሙ አይነታ ይሞላ" : "Memory usage increasing over time",
      solution: language === "am" ? "ሰዎች ላይ ምርመራ እየተካሄደ ነው" : "Investigation in progress",
    },
    {
      id: "db-connection",
      title: language === "am" ? "Database Connection" : "Database Connection",
      status: "resolved",
      severity: "high",
      description: language === "am" ? "ዳታቤዝ ግንኙነት ላክዋ" : "Database connection issues",
      solution: language === "am" ? "ግንኙነት ገድያ ምጣኔ ጨመረ" : "Increased connection pool size",
    },
  ])

  const handleRunDiagnostics = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      toast({
        title: language === "am" ? "ተሳክቷል" : "Success",
        description: language === "am" ? "ስርዓት ምርመራ ተጠናቅቋል" : "System diagnostics completed",
      })
    }, 3000)
  }

  const handleViewLogs = (issueId: string) => {
    setIsViewingLogs(true)
    // Simulate fetching logs
    setTimeout(() => {
      const mockLogs = `[2025-01-06 13:45:22] API Request to /v1/children - Response time: 234ms
[2025-01-06 13:45:20] Database query executed - Rows affected: 15
[2025-01-06 13:45:18] Cache hit for users query
[2025-01-06 13:45:15] Health check passed - System status: OK
[2025-01-06 13:45:10] Memory usage: 64% - Within acceptable range`
      setIssueLogs(mockLogs)
      setIsViewingLogs(false)
      toast({
        title: language === "am" ? "ተሳክቷል" : "Success",
        description: language === "am" ? "ዝርዝር ወርዷል" : "Logs retrieved successfully",
      })
    }, 1500)
  }

  const handleTakeAction = (issueId: string) => {
    setIsExecutingAction(true)
    // Simulate taking action
    setTimeout(() => {
      setIssues(
        issues.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                status: "resolved" as const,
              }
            : issue,
        ),
      )
      setIsExecutingAction(false)
      toast({
        title: language === "am" ? "ተሳክቷል" : "Success",
        description: language === "am" ? "ለማድረግ እርምጃ ተከናውኗል" : "Action executed successfully",
      })
    }, 2000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "investigating":
        return <Activity className="h-5 w-5 text-yellow-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-red-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {language === "am" ? "ስርዓት ችግር ፍታት" : "System Troubleshooting"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === "am" ? "ስርዓት ችግራት ምርመራ እና ፍታት" : "Diagnose and resolve system problems"}
        </p>
      </div>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-blue-900">
              {language === "am" ? "ስርዓት ምርመራ ያካሂዱ" : "Run System Diagnostics"}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {language === "am" ? "ስርዓት ሙሉ ምርመራ ያካሂዱ" : "Run a full system diagnostic check"}
            </p>
          </div>
          <Button onClick={handleRunDiagnostics} disabled={isRunning} className="w-full sm:w-auto whitespace-nowrap">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning
              ? language === "am"
                ? "በሂደት ውስጥ..."
                : "Running..."
              : language === "am"
                ? "ምርመራ ያካሂዱ"
                : "Run Diagnostics"}
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">{language === "am" ? "የተጠቀሙ ጉዳዮች" : "Recent Issues"}</h3>
        {issues.map((issue) => (
          <Card
            key={issue.id}
            className={`p-4 cursor-pointer border transition-colors ${
              selectedIssue === issue.id ? "border-primary bg-muted" : ""
            }`}
            onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
          >
            <div className="flex items-start gap-4">
              {getStatusIcon(issue.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">{issue.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getSeverityColor(issue.severity)}`}
                  >
                    {issue.severity}
                  </span>
                </div>

                {selectedIssue === issue.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">
                        {language === "am" ? "ፍታት" : "Solution"}
                      </p>
                      <p className="text-sm text-muted-foreground">{issue.solution}</p>
                    </div>

                    {issueLogs && (
                      <div className="bg-background rounded border p-3 max-h-48 overflow-y-auto">
                        <p className="text-xs font-semibold text-foreground mb-2">
                          {language === "am" ? "ስርዓት ዝርዝር" : "System Logs"}
                        </p>
                        <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">
                          {issueLogs}
                        </pre>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewLogs(issue.id)
                        }}
                        disabled={isViewingLogs}
                      >
                        {isViewingLogs
                          ? language === "am"
                            ? "ወርድ..."
                            : "Loading..."
                          : language === "am"
                            ? "ዝርዝር ይወርሩ"
                            : "View Logs"}
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTakeAction(issue.id)
                        }}
                        disabled={isExecutingAction || issue.status === "resolved"}
                      >
                        {isExecutingAction
                          ? language === "am"
                            ? "ለማድረግ..."
                            : "Executing..."
                          : language === "am"
                            ? "ምንም ለማድረግ"
                            : "Take Action"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
