import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { checkUserPermission } from "./ability-builder"

/**
 * Middleware to check CASL permissions for API routes
 * @param action - The action to check (create, read, update, delete, manage)
 * @param subject - The subject/domain to check
 * @returns NextResponse or null if authorized
 */
export async function checkPermission(action: string, subject: string) {
  const session: any = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 })
  }

  const hasPermission = await checkUserPermission(Number.parseInt(session.user.id), action, subject)

  if (!hasPermission) {
    return NextResponse.json({ error: "Forbidden - You don't have permission to perform this action" }, { status: 403 })
  }

  return null // Permission granted
}
