import type { TypeOfComponent } from "./Component"
import type { Predicate } from "./Query"

export function Not(Component: TypeOfComponent): Predicate {
  return {
    Component,
    isNot: true,
  }
}
