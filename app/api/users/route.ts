import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/getCurrentUser"
import type { UserType } from "@/lib/db/schema"
import { getusers } from "@/lib/user"
import { checkPermission } from "@/lib/casl/middleware"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const permissionCheck = await checkPermission(request, "read", "User")
  if (permissionCheck) {
    return permissionCheck // Returns 401 or 403 error response
  }

  // Get current user for audit purposes
  const user = await getCurrentUser()

  // Get all users
  const users: UserType[] = await getusers()

  return NextResponse.json({ user: users }, { status: 200 })
}
