"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getFacilities, getUsers, deleteUser, type Facility, type User as AdminUser } from "@/lib/admin-api"
import { useUser } from "@/lib/user-context"

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user: currentUser } = useUser()

  const userId = params?.id
  const [user, setUser] = useState<any>(null)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, facilitiesRes] = await Promise.all([getUsers(), getFacilities()])
        const payload: any = usersRes.data
        const usersArray: any[] =
          (Array.isArray(payload?.users) && payload.users) ||
          (Array.isArray(payload?.data?.data) && payload.data.data) ||
          (Array.isArray(payload?.data) && payload.data) ||
          []
        const found = usersArray.find((u) => String(u?.id) === String(userId))
        setUser(found || null)

        const fPayload: any = facilitiesRes.data
        const fArray =
          (Array.isArray(fPayload?.facilities) && fPayload.facilities) ||
          (Array.isArray(fPayload?.data) && fPayload.data) ||
          []
        setFacilities(fArray as Facility[])
      } catch (e) {
        console.error("Failed to load user details", e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  const facilityNameById = useMemo(() => {
    return facilities.reduce<Record<string, string>>((acc, f) => {
      acc[String((f as any).id)] = f.name
      return acc
    }, {})
  }, [facilities])

  const isMe = String(user?.id) === String((currentUser as any)?.id)
  const facilityName = user?.facility || facilityNameById[String(user?.facility_id)] || "—"

  const handleDelete = async () => {
    if (!user?.id) return
    setIsDeleting(true)
    try {
      await deleteUser(String(user.id))
      router.push("/dashboard/users")
    } catch (e) {
      console.error("Failed to delete user", e)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">
            {isLoading ? "User" : user?.name || "User details"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "" : user?.email || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/users")}>
            Back
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isMe || isDeleting || isLoading}>
                {isMe ? "Cannot delete me" : isDeleting ? "Deleting..." : "Delete user"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove the account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="secondary" className="capitalize">
            {isLoading ? "loading" : user?.role || "—"}
          </Badge>
          {isMe && <Badge variant="secondary">Me</Badge>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium text-foreground mt-1">{isLoading ? "-" : user?.phone || "—"}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">Facility</p>
            <p className="font-medium text-foreground mt-1">{isLoading ? "-" : facilityName}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">User ID</p>
            <p className="font-medium text-foreground mt-1">{isLoading ? "-" : String(user?.id || "—")}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="font-medium text-foreground mt-1">{isLoading ? "-" : user?.created_at || user?.createdAt || "—"}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Actions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Create and delete are supported by your API. Editing needs an update endpoint for users.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" disabled>
            Edit user (coming soon)
          </Button>
          <Button variant="outline" disabled>
            Reset password (coming soon)
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Raw user object</h2>
        <pre className="text-xs mt-3 whitespace-pre-wrap break-all text-foreground">
          {isLoading ? "Loading..." : JSON.stringify(user, null, 2)}
        </pre>
      </Card>
    </div>
  )
}

