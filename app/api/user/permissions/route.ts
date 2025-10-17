import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next/auth"
import { authOptions } from "@/lib/auth"
import { buildAbilityForUser } from "@/lib/casl/ability-builder"

// GET /api/user/permissions - Get current user's permissions
export async function GET(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 })
    }

    const ability = await buildAbilityForUser(Number.parseInt(session.user.id))

    // Convert ability rules to a serializable format
    const rules = ability.rules.map((rule) => ({
      action: rule.action,
      subject: rule.subject,
      conditions: rule.conditions,
      inverted: rule.inverted,
    }))

    return NextResponse.json({
      success: true,
      permissions: rules,
    })
  } catch (error) {
    console.error("[v0] Error fetching user permissions:", error)
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
  }
}
