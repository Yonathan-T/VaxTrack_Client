import { apiClient } from "./api-client"

export interface Campaign {
    id: number
    title: string
    description?: string
    target_region: string
    start_date: string
    end_date: string
    status: string
    target_vaccine_code?: string
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
