import { StateComponent, RefType, NumberType } from "~/ecs/base";

export class TranslucentApplied extends StateComponent {
  opacity: number;

  static props = {
    value: {
      type: RefType,
    },

    opacity: {
      type: NumberType,
    },
  };
}
