import { AbilityBuilder, createMongoAbility, type MongoAbility } from "@casl/ability"

// Define the structure of permissions
export type Actions = "create" | "read" | "update" | "delete" | "manage"
export type Subjects = "Forecast" | "ForecastData" | "ForecastType" | "all"

export type AppAbility = MongoAbility<[Actions, Subjects]>

// Define a default ability (no permissions)
export function defineAbilityFor(permissions: Array<{ domain: string; action: string; constraints?: any }>) {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  // Map database permissions to CASL abilities
  permissions.forEach((permission) => {
    const action = permission.action as Actions
    const subject = permission.domain as Subjects

    if (permission.constraints) {
      // If there are constraints, apply them
      can(action, subject, permission.constraints)
    } else {
      // Otherwise, grant unrestricted permission
      can(action, subject)
    }
  })

  return build()
}

// Create a default ability with no permissions
export function createDefaultAbility() {
  const { build } = new AbilityBuilder<AppAbility>(createMongoAbility)
  return build()
}
