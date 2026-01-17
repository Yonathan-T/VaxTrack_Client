import { apiClient } from "./api-client"

export interface Child {
  id: string
  name: string
  dateOfBirth: string
  gender: string
  parentId: string
  facility?: string
  createdAt: string
}

export interface VaccinationRecord {
  id: string
  childId: string
  vaccineId: string
  vaccineName: string
  dateAdministered: string
  nextDueDate: string
  status: "completed" | "overdue" | "pending"
}

export interface ParentDashboard {
  children: Child[]
  totalChildren: number
  completionRate: number
  upcomingAppointments: any[]
  vaccinations: VaccinationRecord[]
}

export interface Notification {
  id: string
  type: string
  message: string
  createdAt: string
  read: boolean
}

export async function getParentDashboard() {
  return apiClient.get<ParentDashboard>("/v1/parent/dashboard")
}

export async function getChildren() {
  return apiClient.get<{ children: Child[] }>("/v1/children")
}

export async function getChildDetails(childId: string) {
  return apiClient.get<Child>(`/v1/children/${childId}`)
}

export async function registerChild(childData: {
  name: string
  dateOfBirth: string
  gender: string
}) {
  return apiClient.post("/v1/children", childData)
}

export async function getNotifications() {
  return apiClient.get<{ notifications: Notification[] }>("/v1/notifications")
}

export async function markNotificationsAsRead() {
  return apiClient.post("/v1/notifications/mark-all-as-read", {})
}

export async function logoutParent() {
  return apiClient.post("/v1/auth/logout", {})
}

// All endpoints use /v1/ prefix and match the backend specification:
// - GET /v1/parent/dashboard
// - GET /v1/children
// - GET /v1/children/{id}
// - POST /v1/children
// - GET /v1/notifications
// - POST /v1/notifications/mark-all-as-read
// - POST /v1/auth/logout

// No changes needed - endpoints are correct
