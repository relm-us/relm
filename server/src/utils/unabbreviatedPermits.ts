import type { Permission } from "../db/index.js"

export function unabbreviatedPermits(abbrev: string): Permission.Permission[] {
  const permits = []
  if (abbrev.includes("a")) permits.push("access")
  if (abbrev.includes("e")) permits.push("edit")
  if (abbrev.includes("i")) permits.push("invite")
  if (abbrev.includes("x")) permits.push("admin")
  return permits
}
