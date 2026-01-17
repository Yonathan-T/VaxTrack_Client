import { apiClient } from "./api-client"

export interface ChildProfile {
  id: string
  name: string
  dateOfBirth: string
  gender: string
  contact: {
    guardianName: string
    guardianPhone: string
    guardianEmail: string
  }
}

export interface Appointment {
  id: string
  childId: string
  childName: string
  dateTime: string
  status: "scheduled" | "completed" | "missed" | "rescheduled"
  appointmentType: string
}

export interface VaccinationRecord {
  id: string
  childId: string
  vaccineName: string
  dateAdministered: string
  nextDueDate: string
  batchNumber: string
  administeredBy: string
}

export interface Inventory {
  id: string
  vaccineName: string
  quantity: number
  expiryDate: string
  batchNumber: string
  status: "low" | "adequate" | "expired"
}

export interface Capacity {
  date: string
  totalSlots: number
  bookedSlots: number
  availableSlots: number
}

export async function getChildrenList(searchQuery?: string) {
  const url = searchQuery ? `/v1/children?search=${encodeURIComponent(searchQuery)}` : "/v1/children"
  return apiClient.get<{ children: ChildProfile[] }>(url)
}

export async function getChildProfile(childId: string) {
  return apiClient.get<ChildProfile>(`/v1/children/${childId}`)
}

export async function registerNewChild(data: {
  name: string
  dateOfBirth: string
  gender: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
}) {
  return apiClient.post("/v1/children", data)
}

export async function scheduleAppointment(data: {
  childId: string
  vaccine: string
  appointmentDate: string
  appointmentTime: string
  facility: string
  sendSMS?: boolean
  sendEmail?: boolean
  notes?: string
}) {
  return apiClient.post("/v1/appointments", data)
}

export async function getAppointmentsList() {
  return apiClient.get<{ appointments: Appointment[] }>("/v1/appointments")
}

export async function getAppointmentDetails(appointmentId: string) {
  return apiClient.get<Appointment>(`/v1/appointments/${appointmentId}`)
}

export async function rescheduleAppointment(appointmentId: string, newDate: string) {
  return apiClient.put(`/v1/appointments/${appointmentId}`, { newDate })
}

export async function getFacilityCapacity(facilityId: string, date: string) {
  return apiClient.get<Capacity>(`/v1/facilities/${facilityId}/capacity?date=${date}`)
}

export async function administerVaccine(
  vaccinationRecordId: string,
  data: {
    vaccineId: string
    batchNumber: string
    dateAdministered: string
  },
) {
  return apiClient.post(`/v1/vaccination-records/${vaccinationRecordId}/administer`, data)
}

export async function getInventory() {
  return apiClient.get<{ inventory: Inventory[] }>("/v1/inventory")
}

export async function getStockAlerts() {
  return apiClient.get<{ alerts: any[] }>("/v1/alerts")
}

export async function addStock(data: {
  vaccineId: string
  quantity: number
  batchNumber: string
  expiryDate: string
}) {
  return apiClient.post("/v1/inventory/receive", data)
}
