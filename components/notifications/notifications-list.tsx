import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare, CheckCircle2, XCircle, Clock } from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "sms",
    recipient: "Almaz Kebede (+251911234567)",
    child: "Abebe Kebede",
    message: "Reminder: Penta 2 vaccination appointment tomorrow at 10:00 AM",
    status: "sent",
    sentAt: "2024-11-14 09:00 AM",
  },
  {
    id: 2,
    type: "email",
    recipient: "hanna.bekele@example.com",
    child: "Yonas Bekele",
    message: "Appointment confirmation for Measles 1 vaccination",
    status: "sent",
    sentAt: "2024-11-14 08:30 AM",
  },
  {
    id: 3,
    type: "sms",
    recipient: "Selamawit Girma (+251933456789)",
    child: "Bethlehem Girma",
    message: "Your child has missed OPV 2 vaccination. Please schedule an appointment.",
    status: "failed",
    sentAt: "2024-11-13 02:00 PM",
  },
  {
    id: 4,
    type: "sms",
    recipient: "Rahel Haile (+251944567890)",
    child: "Samuel Haile",
    message: "Reminder: BCG vaccination appointment today at 3:30 PM",
    status: "pending",
    sentAt: "Scheduled for 2024-11-15 08:00 AM",
  },
]

export function NotificationsList() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Notifications</h3>
        <Button size="sm" variant="outline">
          Send Bulk SMS
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {notification.type === "sms" ? (
                  <MessageSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Mail className="h-4 w-4 text-secondary" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {notification.type === "sms" ? "SMS" : "Email"}
                </span>
              </div>
              <Badge
                variant={
                  notification.status === "sent"
                    ? "default"
                    : notification.status === "failed"
                      ? "destructive"
                      : "secondary"
                }
                className="text-xs"
              >
                {notification.status === "sent" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {notification.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                {notification.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                {notification.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">To: </span>
                <span className="font-medium text-foreground">{notification.recipient}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Child: </span>
                <span className="font-medium text-foreground">{notification.child}</span>
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{notification.message}</div>
              <div className="text-xs text-muted-foreground">{notification.sentAt}</div>
            </div>

            {notification.status === "failed" && (
              <Button size="sm" variant="outline" className="mt-3 bg-transparent">
                Retry
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
