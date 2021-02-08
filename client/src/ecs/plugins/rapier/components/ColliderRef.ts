import { StateComponent, RefType } from "~/ecs/base";

export class ColliderRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
