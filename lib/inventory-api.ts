import { apiClient } from "./api-client";

export interface InventoryItem {
    id: number;
    vaccine_id: number;
    vaccine: {
        id: number;
        name: string;
        code: string;
    };
    batch_number: string;
    quantity: number;
    min_stock: number;
    expiry_date: string;
    status: "adequate" | "low" | "critical" | "expired";
    manufacturer?: string;
    supplier?: string;
    storage_location?: string;
    received_date?: string;
    created_at?: string;
    updated_at?: string;
}

export interface InventoryLog {
    id: number;
    inventory_item_id: number;
    facility_id: number;
    user_id: number;
    type: string; // 'receipt', 'wastage', 'dispense', 'adjustment'
    quantity: number;
    batch_number?: string;
    reason?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
    };
    inventory_item?: {
        id: number;
        vaccine_id: number;
        batch_number: string;
        vaccine?: {
            id: number;
            name: string;
            code: string;
        };
    };
    facility?: {
        id: number;
        name: string;
    };
}

export interface InventoryResponse {
    data: InventoryItem[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export const inventoryApi = {
    // GET /v1/inventory: list inventory items (paginated/filterable)
    list: (params?: { page?: number; search?: string; status?: string }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.search) searchParams.append("search", params.search);
        if (params?.status) searchParams.append("status", params.status);

        const queryString = searchParams.toString();
        const endpoint = queryString ? `/v1/inventory?${queryString}` : "/v1/inventory";
        return apiClient.get<InventoryResponse>(endpoint);
    },

    // GET /v1/inventory/lookup: search/lookup items (query params; fast search for UI autocomplete)
    lookup: (query: string) => {
        return apiClient.get<InventoryItem[]>(`/v1/inventory/lookup?q=${encodeURIComponent(query)}`);
    },

    // GET /v1/inventory/expiring: list items nearing expiry
    expiring: () => {
        return apiClient.get<InventoryItem[]>("/v1/inventory/expiring");
    },

    // GET /v1/inventory/expired: list expired items
    expired: () => {
        return apiClient.get<InventoryItem[]>("/v1/inventory/expired");
    },

    // POST /v1/inventory/receive: record receiving new stock
    receive: (data: {
        vaccine_id: number;
        batch_number: string;
        quantity: number;
        expiry_date: string;
        supplier?: string;
        notes?: string;
    }) => {
        return apiClient.post<{ message: string; data: InventoryItem }>("/v1/inventory/receive", data);
    },

    // GET /v1/inventory/{item}: show a single inventory item details
    get: (id: number | string) => {
        return apiClient.get<InventoryItem>(`/v1/inventory/${id}`);
    },

    // GET /v1/inventory/{item}/logs: return audit/history logs for the item
    logs: (id: number | string) => {
        return apiClient.get<{ data: InventoryLog[] }>(`/v1/inventory/${id}/logs`);
    },

    // GET /v1/inventory/logs: list all inventory logs (paginated/filterable)
    globalLogs: (params?: {
        type?: string;
        date_from?: string;
        date_to?: string;
        batch_number?: string;
        per_page?: number;
        page?: number
    }) => {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, value.toString());
            });
        }
        const queryString = searchParams.toString();
        const endpoint = queryString ? `/v1/inventory/logs?${queryString}` : "/v1/inventory/logs";
        // Paginated response is wrapped in data
        return apiClient.get<{
            data: InventoryLog[];
            current_page: number;
            last_page: number;
            total: number
        }>(endpoint);
    },

    // GET /v1/inventory/logs/{id}: detail for a single log
    logDetail: (id: number | string) => {
        return apiClient.get<{ data: InventoryLog }>(`/v1/inventory/logs/${id}`);
    },

    // POST /v1/inventory/{item}/wastage: record wastage for an item
    wastage: (id: number | string, data: {
        quantity: number;
        reason: string;
        notes?: string;
    }) => {
        return apiClient.post<{ message: string; data: InventoryItem }>(`/v1/inventory/${id}/wastage`, data);
    }
};
