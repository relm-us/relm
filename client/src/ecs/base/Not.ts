import { TypeOfComponent } from "./Component";
import { Predicate } from "./Query";

export function Not(Component: TypeOfComponent): Predicate {
  return {
    Component,
    isNot: true,
  };
}
