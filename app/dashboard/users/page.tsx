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

  const filtered = users.filter((u) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    )
  })

  const facilityNameById = facilities.reduce<Record<string, string>>((acc, f) => {
    acc[String((f as any).id)] = f.name
    return acc
  }, {})

  const withMeFirst = [...filtered].sort((a: any, b: any) => {
    const aIsMe = String(a?.id) === String((currentUser as any)?.id)
    const bIsMe = String(b?.id) === String((currentUser as any)?.id)
    if (aIsMe && !bIsMe) return -1
    if (!aIsMe && bIsMe) return 1
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
                  const facilityName = u?.facility || facilityNameById[String(u?.facility_id)] || "—"
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
                      {u.createdAt || (u as any).created_at || "—"}
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
