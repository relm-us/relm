import { StateComponent, RefType } from "~/ecs/base";

export class HdImageRef extends StateComponent {
  value: any;

  static props = {
    value: {
      type: RefType,
    },
  };
}
