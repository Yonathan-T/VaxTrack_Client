const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://vaxtrackapi.onrender.com/api"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  status?: number
  code?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token)
      // Set cookie for middleware
      document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      // Clear cookie
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    }
    if (this.token) {
      // VaxTrack requires "Bearer YOUR_TOKEN_HERE" format
      headers["Authorization"] = `Bearer ${this.token}`
    }
    return headers
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data?: T; error?: ApiError; status: number }> {
    try {
      const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
      const url = `${this.baseUrl}${cleanEndpoint}`

      console.log(`[API] ${options.method || "GET"} ${url}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const status = response.status
      const contentType = response.headers.get("content-type")
      let responseData

      if (contentType?.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      if (!response.ok) {
        let message = `HTTP ${status}`

        if (responseData) {
          if (typeof responseData.message === 'string') {
            message = responseData.message
          } else if (typeof responseData.error === 'string') {
            message = responseData.error
          } else if (typeof responseData.message === 'object') {
            message = JSON.stringify(responseData.message)
          } else if (typeof responseData.error === 'object') {
            message = JSON.stringify(responseData.error)
          } else if (responseData.errors) {
            message = JSON.stringify(responseData.errors)
          }
        }

        const error: ApiError = {
          message,
          status,
          code: responseData?.code,
        }
        return { error, status }
      }

      // VaxTrack wraps responses in {"success": true, "data": ...}
      // Extract data field if present, otherwise use full response
      const data = responseData?.data !== undefined ? responseData.data : responseData
      return { data, status }
    } catch (err) {
      let message = "Network error"
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          message = "Request timeout - please check your connection"
        } else {
          message = err.message
        }
      }

      const error: ApiError = {
        message,
        code: "NETWORK_ERROR",
      }
      return { error, status: 0 }
    }
  }

  async get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
