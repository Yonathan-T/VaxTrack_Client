export interface StoredUser {
  id: string
  email: string
  name: string
  password: string
  role: string
  facility?: string
}

// Shared user database
export const users: Map<string, StoredUser> = new Map()

const testAccounts: StoredUser[] = [
  {
    id: "user1",
    email: "healthcare@gmail.com",
    name: "Healthcare Worker",
    password: "Healthcare123!",
    role: "healthcare_worker",
    facility: "Central Health Clinic",
  },
  {
    id: "user2",
    email: "woreda@gmail.com",
    name: "Woreda Officer",
    password: "Woreda123!",
    role: "woreda_officer",
    facility: "Woreda Health Office",
  },
  {
    id: "user3",
    email: "admin@gmail.com",
    name: "Health Facility Administrator",
    password: "Admin123!",
    role: "administrator",
    facility: "Regional Hospital",
  },
  {
    id: "user4",
    email: "sysadmin@gmail.com",
    name: "System Administrator",
    password: "SysAdmin123!",
    role: "system_administrator",
    facility: "Ministry of Health",
  },
  {
    id: "user5",
    email: "parent@gmail.com",
    name: "Guardian",
    password: "Parent123!",
    role: "guardian",
  },
]

// Initialize users map if it's empty (handles hot-reloading issues in dev)
if (users.size === 0) {
  testAccounts.forEach((user) => users.set(user.email, user))
}

export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export function generateToken(userId: string, email: string): string {
  // Using a simplified token generation for the Next.js environment
  // In a real production app, you would use a library like jose or jsonwebtoken
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = btoa(JSON.stringify({ id: userId, email, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }))
  return `${header}.${payload}.mock-signature`
}

export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    return JSON.parse(atob(parts[1]))
  } catch {
    return null
  }
}
