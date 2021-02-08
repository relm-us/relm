import { StateComponent, RefType } from "~/ecs/base";

export class BetterImageMesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
