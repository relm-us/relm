import { StateComponent, RefType } from "~/ecs/base";

export class WallColliderRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
