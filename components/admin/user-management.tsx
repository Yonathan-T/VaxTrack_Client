"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { getUsers, deleteUser } from "@/lib/admin-api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EditUserModal } from "./edit-user-modal"
import type { User } from "@/lib/admin-api"

export function UserManagement() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const { data, error } = await getUsers()
        if (error) {
          toast({
            title: language === "am" ? "ስህተት" : "Error",
            description: error.message,
            variant: "destructive",
          })
          setUsers([])
          return
        }
        if (data && data.users && Array.isArray(data.users)) {
          const validUsers = data.users.filter(
            (user) => user && typeof user === "object" && user.name && user.email && user.role,
          )
          setUsers(validUsers)
        } else {
          setUsers([])
        }
      } catch (err) {
        console.error("[v0] Error fetching users:", err)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [language, toast])

  const filteredUsers = users.filter((user) => {
    if (!user) return false
    const name = (user.name || "").toLowerCase()
    const email = (user.email || "").toLowerCase()
    const role = (user.role || "").toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return name.includes(searchLower) || email.includes(searchLower) || role.includes(searchLower)
  })

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await deleteUser(userToDelete.id)
      if (error) {
        toast({
          title: language === "am" ? "ስህተት" : "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setUsers(users.filter((u) => u.id !== userToDelete.id))
        toast({
          title: language === "am" ? "ተሳክቷል" : "Success",
          description: `${userToDelete.name} ${language === "am" ? "ተሰርዟል" : "has been deleted"}`,
        })
      }
    } catch (err) {
      console.error("[v0] Error deleting user:", err)
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ተጠቃሚን ሰርዞ ሳይችል" : "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleUserSaved = async (newUser: User) => {
    if (selectedUser) {
      // Update existing user
      setUsers(users.map((u) => (u.id === newUser.id ? newUser : u)))
    } else {
      // Add new user - refetch list to ensure consistency
      const { data, error } = await getUsers()
      if (!error && data && data.users) {
        const validUsers = data.users.filter((u) => u && typeof u === "object" && u.name && u.email && u.role)
        setUsers(validUsers)
      } else {
        // Fallback: add to local state if refetch fails
        setUsers([...users, newUser])
      }
    }
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedUser(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{language === "am" ? "ተጠቃሚ ቢሮ" : "User Management"}</h2>
        <p className="text-sm text-muted-foreground">
          {language === "am" ? "ይህ ስርዓት ውስጥ ተጠቃሚዎችን ያስተዳድሩ" : "Manage users in this system"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={language === "am" ? "ተጠቃሚ ይፈልጉ" : "Search users..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 border rounded-lg bg-background text-foreground"
          />
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setSelectedUser(null)
            setIsAddModalOpen(true)
          }}
        >
          {language === "am" ? "አዲስ ተጠቃሚ" : "Add User"}
        </Button>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold">{language === "am" ? "ስም" : "Name"}</th>
              <th className="text-left py-3 px-4 font-semibold">{language === "am" ? "ኢ-ሜይል" : "Email"}</th>
              <th className="text-left py-3 px-4 font-semibold">{language === "am" ? "ሚና" : "Role"}</th>
              <th className="text-left py-3 px-4 font-semibold">{language === "am" ? "ሁኔታ" : "Status"}</th>
              <th className="text-left py-3 px-4 font-semibold">{language === "am" ? "እርምጃ" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  {language === "am" ? "ሕትመት 중..." : "Loading..."}
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  {language === "am" ? "ተጠቃሚ አልተገኘም" : "No users found"}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-muted">
                  <td className="py-3 px-4">{user.name || "-"}</td>
                  <td className="py-3 px-4 text-xs sm:text-sm">{user.email || "-"}</td>
                  <td className="py-3 px-4 text-xs sm:text-sm">{user.role || "-"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : user.status === "inactive"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.status || "pending"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleEdit(user)}>
                        {language === "am" ? "ያርትዑ" : "Edit"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 text-xs"
                        onClick={() => handleDeleteClick(user)}
                      >
                        {language === "am" ? "ሰርዙ" : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditUserModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onUserSaved={handleUserSaved}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === "am" ? "ተጠቃሚን ሰርዙ" : "Delete User"}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === "am"
                ? `${userToDelete?.name} ይህን ተጠቃሚ ይሰርዙ ትብዎ ነው? ይህ እርምጃ ከልሱ ሊመለስ ይችላል።`
                : `Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting}>{language === "am" ? "ይቅር" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
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
