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
  id: string | number
  name: string
  location: string
  address?: string
  woreda?: string | null
  daily_capacity: number
  users_count?: number
  registration_code?: string
  created_at?: string
  updated_at?: string
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
export interface CoverageReportItem {
  vaccine: string
  code: string
  total_given: number
  coverage_percentage: number
  total_children?: number
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

export interface ReportStats {
  total_children: number
  total_parents: number
  total_vaccines_given: number
  total_overdue: number
}

export async function getReportStats() {
  return apiClient.get<ReportStats>("/v1/reports/stats")
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
  password: string
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

export interface TrendData {
  month: string
  bcg: number
  opv0: number
  penta1: number
  pcv1: number
  rota1: number
  opv1: number
  penta2: number
  pcv2: number
  rota2: number
  opv2: number
  penta3: number
  pcv3: number
  opv3: number
  ipv: number
  measles1: number
  measles2: number
  tt1: number
  tt2: number
  tt3: number
  tt4: number
  tt5: number
  [key: string]: string | number
}

export interface GeographicData {
  label: string
  coverage: number
  children: number
  fullyVaccinated: number
}

export interface OverdueVaccine {
  id: number
  vaccine: string
  vaccine_code: string
  scheduled_date: string
  days_overdue: number
  status: string
}

export interface DefaulterData {
  child_id: number
  name: string
  address: {
    kebele: string
    woreda: string
    house_number: string
  }
  parent: string
  parent_phone: string
  parent_email: string
  overdue_vaccines: OverdueVaccine[]
  total_overdue: number
  most_overdue_days: number
}

export interface AnalyticsReport {
  trends: TrendData[]
  geographic: GeographicData[]
  defaulters: DefaulterData[]
}

export async function getAnalyticsReport() {
  return apiClient.get<AnalyticsReport>("/v1/reports/analytics")
}

export async function downloadReport(reportType: "coverage" | "overdue_summary" | "user_list", format: "csv" | "pdf" | "xlsx") {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://vaxtrackapi.onrender.com/api"
  const url = `${baseUrl}/v1/reports/download/${reportType}?format=${format}`
  
  if (token) {
    return { url, token }
  }
  return { url }
}

export async function receiveInventory(data: {
  vaccineId: string
  quantity: number
  batchNumber: string
  expiryDate: string
}) {
  return apiClient.post("/v1/inventory/receive", data)
}
