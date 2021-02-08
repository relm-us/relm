import { TypeOfComponent } from "./Component";
import { Predicate } from "./Query";

export function Modified(Component: TypeOfComponent): Predicate {
  return {
    Component: Component,
    isModified: true,
  };
}
