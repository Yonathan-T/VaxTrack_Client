import { apiClient } from "./api-client"
import type { ChildProfile } from "./healthcare-worker-api"

export interface User {
  id: string
  email: string
  name: string
  role: string
  // Human-readable facility name if present
  facility?: string
  // Facility relation identifier from backend, may be null for super admins
  facility_id?: string | number | null
  // Optional children array from API (for parent accounts), structure may vary
  children?: Array<any>
  createdAt: string
  status: "active" | "inactive" | "pending"
}

export interface Facility {
  id: string
  name: string
  region: string
  district: string
  location: string
  capacity: number
  staff: number
}

export interface VaccineDefinition {
  id: string
  name: string
  abbreviation: string
  dosagePerVial: number
  minAgeMonths: number
  maxAgeMonths: number
  requiredDoses: number
}

export interface CoverageReport {
  period: string
  totalChildren: number
  fullyVaccinated: number
  partiallyVaccinated: number
  unvaccinated: number
  coveragePercentage: number
  byVaccine: Array<{
    vaccineName: string
    coverage: number
  }>
}

export async function getUsers() {
  return apiClient.get<{ users: User[] }>("/v1/admin/users")
}

export async function deleteUser(userId: string) {
  return apiClient.delete(`/v1/admin/users/${userId}`)
}

export async function createUser(data: {
  email: string
  name: string
  role: string
  phone?: string
  facility_id?: string | number | null
}) {
  return apiClient.post("/v1/admin/users", data)
}

export async function getFacilities() {
  return apiClient.get<{ facilities: Facility[] }>("/v1/admin/facilities")
}

export interface AdminSettings {
  [key: string]: any
}

export async function getAdminSettings() {
  return apiClient.get<AdminSettings>("/v1/admin/settings")
}

export async function updateAdminSettings(payload: Record<string, any>) {
  return apiClient.put("/v1/admin/settings", payload)
}

export async function createFacility(data: Omit<Facility, "id">) {
  return apiClient.post("/v1/admin/facilities", data)
}

export async function updateFacility(facilityId: string, data: Partial<Facility>) {
  return apiClient.put(`/v1/admin/facilities/${facilityId}`, data)
}

export async function deleteFacility(facilityId: string) {
  return apiClient.delete(`/v1/admin/facilities/${facilityId}`)
}

export async function getVaccines() {
  return apiClient.get<{ vaccines: VaccineDefinition[] }>("/v1/vaccines")
}

export async function createVaccine(data: Omit<VaccineDefinition, "id">) {
  return apiClient.post("/v1/vaccines", data)
}

export async function updateVaccine(vaccineId: string, data: Partial<VaccineDefinition>) {
  return apiClient.put(`/v1/vaccines/${vaccineId}`, data)
}

export async function deleteVaccine(vaccineId: string) {
  return apiClient.delete(`/v1/vaccines/${vaccineId}`)
}

export async function getCoverageReport(period?: string) {
  const url = period ? `/v1/reports/coverage?period=${period}` : "/v1/reports/coverage"
  return apiClient.get<CoverageReport>(url)
}

export interface AdminDbCheck {
  status: string
  database: string
  host: string
  driver: string
}

export interface AdminSystemStatus {
  status?: string
  issues?: Array<{
    message?: string
    severity?: "info" | "warning" | "critical" | string
    service?: string
    timestamp?: string
  }>
  logs?: any[]
}

export async function getAdminDbCheck() {
  return apiClient.get<AdminDbCheck>("/v1/admin/db-check")
}

export async function getAdminSystemStatus() {
  return apiClient.get<AdminSystemStatus>("/v1/admin/status")
}

// Useful for dashboards (admin roles usually have access too).
export async function getAllChildrenForAdmin(searchQuery?: string) {
  const url = searchQuery
    ? `/v1/children?search=${encodeURIComponent(searchQuery)}`
    : "/v1/children"
  return apiClient.get<{
    data: ChildProfile[]
    current_page: number
    total: number
    per_page: number
  }>(url)
}

export async function receiveInventory(data: {
  vaccineId: string
  quantity: number
  batchNumber: string
  expiryDate: string
}) {
  return apiClient.post("/v1/inventory/receive", data)
}
