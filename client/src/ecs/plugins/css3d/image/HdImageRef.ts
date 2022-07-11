import { LocalComponent, RefType } from "~/ecs/base";

export class HdImageRef extends LocalComponent {
  value: any;

  static props = {
    value: {
      type: RefType,
    },
  };
}
