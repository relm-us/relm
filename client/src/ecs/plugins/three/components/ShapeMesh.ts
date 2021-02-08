import { StateComponent, RefType } from "~/ecs/base";

export class ShapeMesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
