import { LocalComponent, RefType } from "~/ecs/base";

export class ColliderVisibleRef extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
