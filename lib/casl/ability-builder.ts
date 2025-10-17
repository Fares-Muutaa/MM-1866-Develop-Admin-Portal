import { db } from "@/lib/db"
import { permission, rolePermission, userPermission, userRole } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { defineAbilityFor } from "./ability"

/**
 * Build CASL ability from database permissions for a specific user
 * @param userId - The user ID to fetch permissions for
 * @returns CASL Ability object with user's permissions
 */
export async function buildAbilityForUser(userId: number) {
  try {
    // 1. Get user's roles
    const userRoles = await db.select({ role_id: userRole.role_id }).from(userRole).where(eq(userRole.user_id, userId))

    const roleIds = userRoles.map((ur) => ur.role_id)

    // 2. Get permissions from roles
    const rolePermissions =
      roleIds.length > 0
        ? await db
            .select({
              domain: permission.domain,
              action: permission.action,
              constraints: rolePermission.constraints,
            })
            .from(rolePermission)
            .innerJoin(permission, eq(rolePermission.permission_id, permission.permission_id))
            .where(and(...roleIds.map((roleId) => eq(rolePermission.role_id, roleId))))
        : []

    // 3. Get direct user permissions (not revoked)
    const directUserPermissions = await db
      .select({
        domain: permission.domain,
        action: permission.action,
        constraints: userPermission.constraints,
      })
      .from(userPermission)
      .innerJoin(permission, eq(userPermission.permission_id, permission.permission_id))
      .where(and(eq(userPermission.user_id, userId), eq(userPermission.revoked, false)))

    // 4. Combine all permissions
    const allPermissions = [...rolePermissions, ...directUserPermissions]

    // 5. Build and return the ability
    return defineAbilityFor(allPermissions)
  } catch (error) {
    console.error("[v0] Error building ability for user:", error)
    // Return an ability with no permissions on error
    const { defineAbilityFor } = await import("./ability")
    return defineAbilityFor([])
  }
}

/**
 * Check if a user has a specific permission
 * @param userId - The user ID
 * @param action - The action to check (create, read, update, delete, manage)
 * @param subject - The subject/domain to check
 * @returns boolean indicating if user has permission
 */
export async function checkUserPermission(userId: number, action: string, subject: string): Promise<boolean> {
  const ability = await buildAbilityForUser(userId)
  return ability.can(action as any, subject as any)
}
