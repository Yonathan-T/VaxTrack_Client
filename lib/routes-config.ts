export const publicRoutes = ["/", "/login", "/register", "/auth/forgot-password", "/auth/reset-password"]

export const protectedRoutes = ["/dashboard"]

export const roleBasedRoutes: Record<string, string[]> = {
  healthcare_worker: [
    "/dashboard",
    "/dashboard/children",
    "/dashboard/vaccinations",
    "/dashboard/appointments",
    "/dashboard/inventory",
  ],
  woreda_officer: ["/dashboard", "/dashboard/children", "/dashboard/vaccinations", "/dashboard/reports"],
  admin: [
    "/dashboard",
    "/dashboard/children",
    "/dashboard/vaccinations",
    "/dashboard/appointments",
    "/dashboard/reports",
    "/dashboard/inventory",
    "/dashboard/settings",
  ],
  parent: ["/dashboard", "/dashboard/children", "/dashboard/notifications", "/dashboard/settings"],
  system_administrator: ["/dashboard", "/dashboard/settings"],
}

export function isPublicRoute(path: string): boolean {
  return publicRoutes.some((route) => path.startsWith(route))
}

export function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some((route) => path.startsWith(route))
}

export function canAccessRoute(userRole: string | undefined, path: string): boolean {
  if (!userRole) return false
  const allowedRoutes = roleBasedRoutes[userRole] || []
  return allowedRoutes.some((route) => path.startsWith(route))
}
