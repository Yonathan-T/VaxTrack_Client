import { apiClient } from "./api-client"

export interface User {
  id: string
  email: string
  name: string
  role: string
  facility?: string
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

export async function getFacilities() {
  return apiClient.get<{ facilities: Facility[] }>("/v1/admin/facilities")
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

export async function receiveInventory(data: {
  vaccineId: string
  quantity: number
  batchNumber: string
  expiryDate: string
}) {
  return apiClient.post("/v1/inventory/receive", data)
}
