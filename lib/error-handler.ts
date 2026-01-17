import type { ApiError } from "./api-client"

export interface ErrorDisplayConfig {
  title: string
  message: string
  severity: "error" | "warning" | "info"
  autoClose?: boolean
  duration?: number
}

export function parseApiError(error: ApiError | null): ErrorDisplayConfig {
  if (!error) {
    return {
      title: "Success",
      message: "Operation completed successfully",
      severity: "info",
    }
  }

  // Handle specific error codes
  switch (error.code) {
    case "NETWORK_ERROR":
      return {
        title: "Network Error",
        message: "Unable to connect to the server. Please check your internet connection.",
        severity: "error",
        autoClose: true,
        duration: 5000,
      }
    case "AUTH_ERROR":
      return {
        title: "Authentication Failed",
        message: "Your session has expired. Please log in again.",
        severity: "error",
        autoClose: true,
        duration: 3000,
      }
    case "VALIDATION_ERROR":
      return {
        title: "Validation Error",
        message: error.message || "Please check your input and try again.",
        severity: "warning",
      }
    case "NOT_FOUND":
      return {
        title: "Not Found",
        message: "The requested resource could not be found.",
        severity: "warning",
      }
    case "PERMISSION_DENIED":
      return {
        title: "Access Denied",
        message: "You do not have permission to perform this action.",
        severity: "error",
      }
    default:
      return {
        title: error.status ? `Error ${error.status}` : "Error",
        message: error.message || "An unexpected error occurred. Please try again.",
        severity: error.status && error.status >= 500 ? "error" : "warning",
        autoClose: true,
        duration: 5000,
      }
  }
}

export function handleApiError(error: ApiError | null, fallbackMessage: string): string {
  const config = parseApiError(error)
  return config.message || fallbackMessage
}
