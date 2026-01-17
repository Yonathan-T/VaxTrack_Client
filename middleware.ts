import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value || ""
  const { pathname } = request.nextUrl

  // Define public paths
  const isPublicPath = pathname === "/login" || pathname === "/register" || pathname === "/"

  // Redirect logic
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isPublicPath && !token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*"],
}
