import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Clock, CheckCircle, PlayCircle, Users } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/hooks/use-toast"
import { getNurseQueue, startVaccinationSession, completeVaccinationSession } from "@/lib/healthcare-worker-api"

interface NurseQueueItem {
  id: string | number
  child: {
    id: string | number
    first_name: string
    last_name: string
  }
  status: "scheduled" | "ongoing" | "completed"
  assigned_to?: string | number
  assigned_nurse?: {
    id: string | number
    name: string
  }
  scheduled_at: string
  ethiopian_time?: string
  notes?: string
}

export function NurseQueue() {
  const { language } = useLanguage()
  const { user } = useUser()
  const { toast } = useToast()
  const [queue, setQueue] = useState<NurseQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | number | null>(null)

  const fetchQueue = async () => {
    try {
      setIsLoading(true)
      const response = await getNurseQueue()

      if (response.error) {
        toast({
          title: "Error",
          description: response.error.message || "Failed to load nurse queue",
          variant: "destructive",
        })
        return
      }

      if (response.data) {
        setQueue(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error("[NurseQueue] Error:", error)
      toast({
        title: "Error",
        description: "Failed to load nurse queue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartSession = async (appointmentId: string | number) => {
    try {
      setActionLoading(appointmentId)
      const response = await startVaccinationSession(appointmentId)

      if (response.error) {
        toast({
          title: "Error",
          description: response.error.message || "Failed to start session",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Session Started",
        description: "Child is now assigned to you for vaccination.",
      })

      // Refresh queue
      fetchQueue()
    } catch (error) {
      console.error("[NurseQueue] Start session error:", error)
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCompleteSession = async (appointmentId: string | number) => {
    try {
      setActionLoading(appointmentId)
      const response = await completeVaccinationSession(appointmentId)

      if (response.error) {
        toast({
          title: "Error",
          description: response.error.message || "Failed to complete session",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Session Completed",
        description: "Vaccination session completed successfully.",
      })

      // Refresh queue
      fetchQueue()
    } catch (error) {
      console.error("[NurseQueue] Complete session error:", error)
      toast({
        title: "Error",
        description: "Failed to complete session",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const canClaim = (item: NurseQueueItem) => {
    return item.status === "scheduled" && !item.assigned_to
  }

  const canComplete = (item: NurseQueueItem) => {
    return item.status === "ongoing" && item.assigned_to === user?.id
  }

  const isClaimedByOthers = (item: NurseQueueItem) => {
    return item.status === "ongoing" && item.assigned_to !== user?.id
  }

  useEffect(() => {
    fetchQueue()
    // Refresh queue every 30 seconds to get real-time updates
    const interval = setInterval(fetchQueue, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Nurse Queue
          </CardTitle>
          <CardDescription>Real-time vaccination queue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const waitingQueue = queue.filter(item => item.status === "scheduled")
  const inProgressQueue = queue.filter(item => item.status === "ongoing")

  return (
    <div className="space-y-6">
      {/* Waiting Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Waiting for Vaccination ({waitingQueue.length})
          </CardTitle>
          <CardDescription>Children ready to be claimed for vaccination</CardDescription>
        </CardHeader>
        <CardContent>
          {waitingQueue.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No children waiting for vaccination</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {item.child.first_name} {item.child.last_name}
                      </p>
                      {item.ethiopian_time && (
                        <p className="text-sm text-muted-foreground">
                          🕐 {item.ethiopian_time}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Waiting</Badge>
                    {canClaim(item) && (
                      <Button
                        size="sm"
                        onClick={() => handleStartSession(item.id)}
                        disabled={actionLoading === item.id}
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start Session
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* In Progress Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            In Progress ({inProgressQueue.length})
          </CardTitle>
          <CardDescription>Children currently being vaccinated</CardDescription>
        </CardHeader>
        <CardContent>
          {inProgressQueue.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vaccinations in progress</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inProgressQueue.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    isClaimedByOthers(item)
                      ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800"
                      : "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isClaimedByOthers(item)
                        ? "bg-orange-100 dark:bg-orange-900/20"
                        : "bg-green-100 dark:bg-green-900/20"
                    }`}>
                      <User className={`h-5 w-5 ${
                        isClaimedByOthers(item)
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-green-600 dark:text-green-400"
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {item.child.first_name} {item.child.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isClaimedByOthers(item)
                          ? `With ${item.assigned_nurse?.name || 'Another Nurse'}`
                          : "With You"
                        }
                      </p>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isClaimedByOthers(item) ? "outline" : "default"}>
                      {isClaimedByOthers(item) ? "In Progress" : "Your Session"}
                    </Badge>
                    {canComplete(item) && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleCompleteSession(item.id)}
                        disabled={actionLoading === item.id}
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
