import { LocalComponent, RefType } from "~/ecs/base";

export class CssShapeMesh extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
