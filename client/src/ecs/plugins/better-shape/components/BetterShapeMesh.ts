import { StateComponent, RefType } from "~/ecs/base";

export class BetterShapeMesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
