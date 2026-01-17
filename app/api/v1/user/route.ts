import { type NextRequest, NextResponse } from "next/server"
import { users, verifyToken } from "@/lib/user-storage"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = Array.from(users.values()).find((u) => u.id === decoded.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        facility: user.facility,
      },
    })
  } catch (error) {
    console.log("[v0] Get user error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 401 })
  }
}
