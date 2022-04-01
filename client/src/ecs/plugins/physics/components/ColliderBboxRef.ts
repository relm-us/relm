import { StateComponent, RefType } from "~/ecs/base";

export class ColliderBboxRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
