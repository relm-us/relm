import { StateComponent, RefType } from "~/ecs/base";

export class ColliderVisibleRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
