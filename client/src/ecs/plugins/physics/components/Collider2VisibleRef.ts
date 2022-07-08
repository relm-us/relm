import { StateComponent, RefType } from "~/ecs/base";

export class Collider2VisibleRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
