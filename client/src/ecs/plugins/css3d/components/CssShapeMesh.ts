import { StateComponent, RefType } from "~/ecs/base";

export class CssShapeMesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
