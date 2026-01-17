import { type NextRequest, NextResponse } from "next/server"
import { users, generateToken } from "@/lib/user-storage"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("[v0] Login attempt with email:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = users.get(email)

    console.log("[v0] Login attempt for:", email)
    console.log("[v0] User found in storage:", !!user)
    console.log("[v0] Users in storage:", Array.from(users.keys()))
    if (user) {
      console.log("[v0] Stored password:", user.password)
      console.log("[v0] Provided password:", password)
      console.log("[v0] Password match:", user.password === password)
    }

    if (!user || user.password !== password) {
      console.log("[v0] Authentication failed - invalid credentials")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = generateToken(user.id, user.email)

    const response = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          facility: user.facility,
        },
      },
    }

    console.log("[v0] Login successful for:", email)
    console.log("[v0] Returning response:", JSON.stringify(response))

    return NextResponse.json(response)
  } catch (error) {
    console.log("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
