"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Backup {
  id: string
  date: string
  size: string
  status: "completed" | "pending"
}

export function BackupManagement() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [backupToDelete, setBackupToDelete] = useState<Backup | null>(null)

  useEffect(() => {
    const loadBackups = async () => {
      try {
        setLoading(true)
        // Using mock data for now - replace with actual API call when available
        const mockBackups: Backup[] = [
          { id: "1", date: "2025-01-03", size: "245 MB", status: "completed" },
          { id: "2", date: "2025-01-02", size: "243 MB", status: "completed" },
          { id: "3", date: "2025-01-01", size: "240 MB", status: "completed" },
        ]
        setBackups(mockBackups)
      } catch (err) {
        console.error("[v0] Error loading backups:", err)
        toast({
          title: language === "am" ? "ስህተት" : "Error",
          description: language === "am" ? "ምልክቶች መጫን ተስፈዋል" : "Failed to load backups",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadBackups()
  }, [language, toast])

  const handleBackup = async () => {
    setIsBackingUp(true)
    try {
      // Replace with actual API call when available
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const newBackup: Backup = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        size: "240 MB",
        status: "completed",
      }
      setBackups([newBackup, ...backups])

      toast({
        title: language === "am" ? "ተሳክቷል" : "Success",
        description: language === "am" ? "ምልክት በተሳካ ሁኔታ ተፈጠረ" : "Backup created successfully",
      })
    } catch (err) {
      console.error("[v0] Error creating backup:", err)
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ምልክት ሰሪ ወኑ" : "Failed to create backup",
        variant: "destructive",
      })
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleDownload = async (backup: Backup) => {
    setIsDownloading(backup.id)
    try {
      // Replace with actual API call when available
      // For now, create a mock file download
      const mockData = `Database Backup - ${backup.date}\nSize: ${backup.size}\nStatus: ${backup.status}`
      const blob = new Blob([mockData], { type: "application/octet-stream" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `backup-${backup.date}.sql`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: language === "am" ? "ተሳክቷል" : "Success",
        description: language === "am" ? "ምልክት ወርዶ ታግዷል" : "Backup downloaded successfully",
      })
    } catch (err) {
      console.error("[v0] Error downloading backup:", err)
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ምልክት ወርድ ተስፈዋል" : "Failed to download backup",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(null)
    }
  }

  const handleDeleteClick = (backup: Backup) => {
    setBackupToDelete(backup)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!backupToDelete) return

    setIsDeleting(backupToDelete.id)
    try {
      // Replace with actual API call when available
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setBackups(backups.filter((b) => b.id !== backupToDelete.id))

      toast({
        title: language === "am" ? "ተሳክቷል" : "Success",
        description: language === "am" ? "ምልክት ተሰርዟል" : "Backup deleted successfully",
      })
    } catch (err) {
      console.error("[v0] Error deleting backup:", err)
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ምልክት ሰርዞ ተስፈዋል" : "Failed to delete backup",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setIsDeleteDialogOpen(false)
      setBackupToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{language === "am" ? "ዳታቤዝ ምልክቶች" : "Database Backups"}</h2>
        <p className="text-sm text-muted-foreground">
          {language === "am" ? "ዳታቤዝ ምልክቶች ያስተዳድሩ" : "Manage database backups"}
        </p>
      </div>

      <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-blue-900 text-sm sm:text-base">
              {language === "am" ? "አሁኑ ምልክት መስራት" : "Create Backup Now"}
            </h3>
            <p className="text-xs sm:text-sm text-blue-700 mt-1">
              {language === "am" ? "ወዲያውኑ ዳታቤዝ ምልክት ይስሩ" : "Backup database immediately"}
            </p>
          </div>
          <Button onClick={handleBackup} disabled={isBackingUp} className="w-full sm:w-auto whitespace-nowrap">
            {isBackingUp
              ? language === "am"
                ? "መስራት..."
                : "Creating..."
              : language === "am"
                ? "ምልክት መስራት"
                : "Create Backup"}
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold text-foreground text-sm sm:text-base">
          {language === "am" ? "የቀደሙ ምልክቶች" : "Recent Backups"}
        </h3>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">{language === "am" ? "ሕትመት..." : "Loading..."}</div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === "am" ? "ምልክቶች አልተገኙም" : "No backups found"}
          </div>
        ) : (
          backups.map((backup) => (
            <Card key={backup.id} className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{backup.date}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{backup.size}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {backup.status === "completed" ? (language === "am" ? "ተጠናቅቋል" : "Completed") : "Pending"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none text-xs sm:text-sm bg-transparent"
                    onClick={() => handleDownload(backup)}
                    disabled={isDownloading === backup.id}
                  >
                    {isDownloading === backup.id
                      ? language === "am"
                        ? "ወርድ..."
                        : "Downloading..."
                      : language === "am"
                        ? "ቀንሰል"
                        : "Download"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none text-red-600 bg-transparent text-xs sm:text-sm hover:text-red-700"
                    onClick={() => handleDeleteClick(backup)}
                    disabled={isDeleting === backup.id}
                  >
                    {isDeleting === backup.id
                      ? language === "am"
                        ? "ሰርዞ..."
                        : "Deleting..."
                      : language === "am"
                        ? "ሰርዙ"
                        : "Delete"}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === "am" ? "ምልክት ሰርዙ" : "Delete Backup"}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === "am"
                ? `${backupToDelete?.date} ን ይህን ምልክት ይሰርዙ ትብዎ ነው? ይህ እርምጃ ከልሱ ሊመለስ ይችላል።`
                : `Are you sure you want to delete the backup from ${backupToDelete?.date}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting !== null}>{language === "am" ? "ይቅር" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (language === "am" ? "ሰርዞ ምሙት..." : "Deleting...") : language === "am" ? "ሰርዙ" : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
