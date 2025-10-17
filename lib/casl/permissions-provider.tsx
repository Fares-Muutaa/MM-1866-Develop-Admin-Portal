"use client"

import { createContext, useContext, type ReactNode } from "react"
import { createContextualCan } from "@casl/react"
import { type AppAbility, createDefaultAbility } from "./ability"

const AbilityContext = createContext<AppAbility>(createDefaultAbility())

export const Can = createContextualCan(AbilityContext.Consumer)

interface PermissionsProviderProps {
  children: ReactNode
  ability: AppAbility
}

export function PermissionsProvider({ children, ability }: PermissionsProviderProps) {
  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
}

export function useAbility() {
  return useContext(AbilityContext)
}
