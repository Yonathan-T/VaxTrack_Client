import { apiClient } from "./api-client"

export interface Facility {
    id: string | number
    name: string
    location: string
    address?: string
    phone: string
    woreda?: string | null
    sub_city_id?: string | number | null
    daily_capacity: number
    num_nurses?: number | null
    opens_at?: string
    closes_at?: string
    lunch_starts_at?: string
    lunch_ends_at?: string
    registration_code?: string
    users_count?: number
    created_at?: string
    updated_at?: string
}

export interface Campaign {
    id: number
    title: string
    description?: string
    target_region?: string
    start_date: string
    end_date: string
    status: string
    target_vaccine_code?: string
    target_population?: number
    target_age_group?: string
    facility_ids?: number[]
}

export interface CampaignsResponse {
    success: boolean
    message: string
    data: {
        data: Campaign[]
        current_page: number
        last_page: number
        total: number
        per_page: number
    }
}

export async function getFacilities() {
    return apiClient.get<{ success: boolean; data: Facility[] }>("/v1/facilities")
}

export async function getFacility(id: string | number) {
    return apiClient.get<{ success: boolean; data: Facility & { users: any[] } }>(`/v1/facilities/${id}`)
}

export async function createFacility(data: Omit<Facility, "id" | "created_at" | "updated_at">) {
    return apiClient.post<{ success: boolean; data: Facility }>("/v1/facilities", data)
}

export async function updateFacility(id: string | number, data: Partial<Facility>) {
    return apiClient.put<{ success: boolean; data: Facility }>(`/v1/facilities/${id}`, data)
}

export async function deleteFacility(id: string | number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/v1/facilities/${id}`)
}

export async function getCampaigns(page = 1) {
    return apiClient.get<CampaignsResponse>(`/v1/official/campaigns?page=${page}`)
}

export async function createCampaign(data: Omit<Campaign, "id" | "status">) {
    return apiClient.post<{ success: boolean; message: string; campaign_id: number }>("/v1/official/campaigns", data)
}

export async function updateCampaign(id: number | string, data: Partial<Campaign>) {
    return apiClient.request<CampaignsResponse>(`/v1/official/campaigns/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
    })
}

export async function deleteCampaign(id: number | string) {
    return apiClient.delete<{ success: boolean; message: string }>(`/v1/official/campaigns/${id}`)
}
