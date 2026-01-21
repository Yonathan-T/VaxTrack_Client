"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getFacilities, getUsers, type Facility, type User as AdminUser } from "@/lib/admin-api"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser } from "@/lib/user-context"

export default function UsersPage() {
  const { user: currentUser } = useUser()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, facilitiesRes] = await Promise.all([getUsers(), getFacilities()])

        const payload: any = usersRes.data
        const usersArray =
          (Array.isArray(payload?.users) && payload.users) ||
          (Array.isArray(payload?.data?.data) && payload.data.data) ||
          (Array.isArray(payload?.data) && payload.data) ||
          []
        setUsers(usersArray as AdminUser[])

        const fPayload: any = facilitiesRes.data
        const fArray =
          (Array.isArray(fPayload?.facilities) && fPayload.facilities) ||
          (Array.isArray(fPayload?.data) && fPayload.data) ||
          []
        setFacilities(fArray as Facility[])
      } catch (e) {
        console.error("Failed to load users", e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">All accounts from /v1/admin/users</p>
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
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/users/${u.id}`}>Details</Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
