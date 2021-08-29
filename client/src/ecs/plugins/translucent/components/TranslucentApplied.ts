import { StateComponent, RefType } from "~/ecs/base";

export class TranslucentApplied extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
