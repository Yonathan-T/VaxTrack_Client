import { apiClient } from "./api-client"

export interface Child {
  id: string
  first_name: string
  last_name: string
  name?: string
  date_of_birth: string
  sex: string
  national_id?: string
  address?: string
  user_id?: number
  registered_by?: number
  facility_id?: number
  created_at?: string
  updated_at?: string
  vaccination_records?: {
    id: number
    scheduled_date: string
    date_administered: string | null
    status: string
    vaccine: {
      name: string
      description: string
    }
  }[]
  appointments?: {
    id: number
    appointment_date: string
    status: string
    notes: string | null
  }[]
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
  return apiClient.get<Child[]>("/v1/children")
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

export async function updateProfile(profileData: {
  name?: string
  email?: string
  phone?: string
}) {
  return apiClient.put("/v1/user/profile", profileData)
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
