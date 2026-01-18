import { apiClient } from "./api-client"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export interface RegisterRequest {
  email: string
  password: string
  password_confirmation: string
  name: string
  phone: string
  //role: string
  facility?: string
}

export interface RegisterResponse {
  message: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export async function loginUser(credentials: LoginRequest) {
  return apiClient.post<LoginResponse>("/auth/login", credentials)
}

export async function registerUser(data: RegisterRequest) {
  return apiClient.post<RegisterResponse>("/auth/register", data)
}

export async function registerStaff(data: RegisterRequest) {
  return apiClient.post<RegisterResponse>("/auth/staff/register", data)
}

export async function getProfile() {
  return apiClient.get("/v1/user")
}

export async function updateProfile(data: { name?: string; email?: string; phone?: string }) {
  return apiClient.put("/v1/user/profile", data)
}

export async function logoutUser() {
  return apiClient.post("/v1/auth/logout", {})
}

export async function resetPassword(email: string) {
  return apiClient.post("/auth/forgot-password", { email })
}

export async function submitNewPassword(token: string, password: string) {
  return apiClient.post("/auth/reset-password", { token, password })
}

export async function googleOAuthRedirect() {
  // This endpoint redirects to Google OAuth flow
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/auth/social/google/redirect`
}

export async function checkSystemStatus() {
  return apiClient.get("/status")
}
