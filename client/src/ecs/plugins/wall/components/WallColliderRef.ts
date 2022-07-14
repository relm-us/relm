import { LocalComponent, RefType } from "~/ecs/base";

export class WallColliderRef extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
