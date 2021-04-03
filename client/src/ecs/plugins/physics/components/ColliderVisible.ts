import { StateComponent, RefType } from "~/ecs/base";

export class ColliderVisible extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
