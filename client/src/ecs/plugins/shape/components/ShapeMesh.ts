import { LocalComponent, RefType } from "~/ecs/base";

export class ShapeMesh extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
