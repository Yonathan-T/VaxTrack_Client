"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getFacilities, getUsers, createUser, deleteUser, type Facility, type User as AdminUser } from "@/lib/admin-api"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser } from "@/lib/user-context"
import { Plus, Trash2, Search, UserPlus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UsersPage() {
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // Create user form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "healthcare_worker",
    phone: "",
    facility_id: "" as string | null
  })

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [usersRes, facilitiesRes] = await Promise.all([getUsers(), getFacilities()])

      const payload: any = usersRes.data
      const usersArray =
        (Array.isArray(payload) && payload) ||
        (Array.isArray(payload?.users) && payload.users) ||
        (Array.isArray(payload?.data?.data) && payload.data.data) ||
        (Array.isArray(payload?.data) && payload.data) ||
        []
      setUsers(usersArray as AdminUser[])

      const fPayload: any = facilitiesRes.data
      const fArray =
        (Array.isArray(fPayload) && fPayload) ||
        (Array.isArray(fPayload?.facilities) && fPayload.facilities) ||
        (Array.isArray(fPayload?.data) && fPayload.data) ||
        []
      setFacilities(fArray as Facility[])
    } catch (e) {
      console.error("Failed to load users", e)
      toast({
        title: "Error",
        description: "Failed to load users and facilities",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const { error } = await createUser({
        ...formData,
        facility_id: formData.facility_id === "null" || formData.facility_id === "" ? null : formData.facility_id
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to create user",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "User created successfully",
        })
        setIsAddModalOpen(false)
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "healthcare_worker",
          phone: "",
          facility_id: ""
        })
        loadData()
      }
    } catch (err) {
      console.error("Create user error:", err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await deleteUser(userId)
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete user",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        loadData()
      }
    } catch (err) {
      console.error("Delete user error:", err)
    } finally {
      setIsDeleting(null)
    }
  }

  const isSuperAdmin = currentUser?.role === "admin" && (currentUser as any)?.facility_id == null
  const isLocalAdmin = currentUser?.role === "admin" && (currentUser as any)?.facility_id != null

  const filtered = users.filter((u: any) => {
    // Facility scoping: local admins see users tied to their facility either by user's facility_id
    // or via any child's facility_id matching theirs (parents usually have null facility_id)
    if (isLocalAdmin) {
      const myFacilityId = String((currentUser as any)?.facility_id)
      const userFacilityId = u?.facility_id != null ? String(u?.facility_id) : ""
      const childMatches = Array.isArray(u?.children)
        ? u.children.some((c: any) => String(c?.facility_id) === myFacilityId)
        : false
      if (!myFacilityId || (myFacilityId !== userFacilityId && !childMatches)) return false
    }
    // Search filter
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      String(u?.name || "").toLowerCase().includes(q) ||
      String(u?.email || "").toLowerCase().includes(q) ||
      String(u?.role || "").toLowerCase().includes(q)
    )
  })

  const facilityNameById = facilities.reduce<Record<string, string>>((acc, f) => {
    acc[String((f as any).id)] = f.name
    return acc
  }, {})

  // Fallback: collect names from user records or their children's facility objects if available
  users.forEach((u: any) => {
    if (u.facility && u.facility_id) {
      const name = typeof u.facility === "string" ? u.facility : (u.facility as any).name
      if (name) facilityNameById[String(u.facility_id)] = name
    }
    if (Array.isArray(u.children)) {
      u.children.forEach((c: any) => {
        if (c.facility?.name && c.facility_id) {
          facilityNameById[String(c.facility_id)] = c.facility.name
        }
      })
    }
  })

  const withMeFirst = [...filtered].sort((a: any, b: any) => {
    // Pin current user first
    const aIsMe = String(a?.id) === String((currentUser as any)?.id)
    const bIsMe = String(b?.id) === String((currentUser as any)?.id)
    if (aIsMe && !bIsMe) return -1
    if (!aIsMe && bIsMe) return 1

    // For local admins, rank nurses (healthcare_worker) first, then parents tied via children, then others
    if (isLocalAdmin) {
      const rank = (u: any) => {
        if ((u?.role || "").toLowerCase() === "healthcare_worker") return 0
        const myFacilityId = String((currentUser as any)?.facility_id)
        const childMatches = Array.isArray(u?.children)
          ? u.children.some((c: any) => String(c?.facility_id) === myFacilityId)
          : false
        if (childMatches && (u?.role || "").toLowerCase() === "parent") return 1
        return 2
      }
      const ra = rank(a)
      const rb = rank(b)
      if (ra !== rb) return ra - rb
    }

    return String(a?.name || "").localeCompare(String(b?.name || ""))
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">All accounts from /v1/admin/users</p>
        </div>
        {isSuperAdmin && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new administrative or healthcare worker account.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(val) => setFormData({ ...formData, role: val })}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health_official">Health Official</SelectItem>
                        <SelectItem value="healthcare_worker">Healthcare Worker</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facility">Facility</Label>
                    <Select
                      value={formData.facility_id || "null"}
                      onValueChange={(val) => setFormData({ ...formData, facility_id: val })}
                    >
                      <SelectTrigger id="facility">
                        <SelectValue placeholder="Select facility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">Global (No Facility)</SelectItem>
                        {facilities.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    placeholder="+2519..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Input
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${filtered.length} of ${users.length} users`}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr className="[&>th]:py-3 [&>th]:px-3 text-left">
                <th className="w-12">#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Facility</th>
                <th>Created</th>
                <th className="w-28"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : withMeFirst.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                withMeFirst.map((u: any, idx: number) => {
                  const isMe = String(u?.id) === String((currentUser as any)?.id)
                  const childFacilityName = Array.isArray(u?.children) && u.children.length > 0
                    ? (u.children.find((c: any) => c?.facility?.name)?.facility?.name) ||
                    facilityNameById[String((u.children.find((c: any) => c?.facility_id != null) || {}).facility_id)]
                    : undefined
                  const facilityName =
                    u?.facility ||
                    (u?.facility_id != null ? facilityNameById[String(u.facility_id)] : undefined) ||
                    (u.role !== 'parent' ? childFacilityName : undefined) ||
                    "—"

                  const formatDate = (dateStr: string) => {
                    if (!dateStr) return "—"
                    try {
                      return new Date(dateStr).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    } catch (e) {
                      return dateStr
                    }
                  }
                  return (
                    <tr key={u.id} className="border-b last:border-b-0 hover:bg-muted/40">
                      <td className="py-3 px-3 text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 px-3 font-medium text-foreground truncate">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{u.name || "—"}</span>
                          {isMe && (
                            <Badge variant="secondary" className="text-xs">
                              Me
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground truncate">{u.email || "—"}</td>
                      <td className="py-3 px-3 text-muted-foreground truncate">{(u as any).phone || "—"}</td>
                      <td className="py-3 px-3">
                        <Badge variant="secondary" className="capitalize">
                          {u.role || "—"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground truncate">{facilityName}</td>
                      <td className="py-3 px-3 text-muted-foreground truncate">
                        {formatDate(u.createdAt || (u as any).created_at)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/users/${u.id}`}>Details</Link>
                          </Button>
                          {isSuperAdmin && !isMe && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setIsDeleting(u.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AlertDialog open={isDeleting !== null} onOpenChange={(open) => !open && setIsDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => isDeleting && handleDeleteUser(isDeleting)}
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
