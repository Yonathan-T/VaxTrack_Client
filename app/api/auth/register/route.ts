import { type NextRequest, NextResponse } from "next/server"
import { users, generateToken } from "@/lib/user-storage"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role, facility } = body

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (users.has(email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      name: fullName,
      password,
      role: role || "healthcare_worker",
      facility: facility || "",
    }

    users.set(email, newUser)

    const token = generateToken(newUser.id, newUser.email)

    return NextResponse.json({
      message: "Registration successful",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        facility: newUser.facility, // Added facility to response
      },
    })
  } catch (error) {
    console.log("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
