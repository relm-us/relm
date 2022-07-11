import { LocalComponent, RefType } from "~/ecs/base";

export class ColliderRef extends LocalComponent {
  value: any;

  static props = {
    value: {
      type: RefType,
    },
  };
}
