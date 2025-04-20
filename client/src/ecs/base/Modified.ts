import type { TypeOfComponent } from "./Component"
import type { Predicate } from "./Query"

export function Modified(Component: TypeOfComponent): Predicate {
  return {
    Component: Component,
    isModified: true,
  }
}
