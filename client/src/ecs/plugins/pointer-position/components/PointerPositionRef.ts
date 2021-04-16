import { StateComponent, RefType, NumberType } from "~/ecs/base";

export class PointerPositionRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },

    updateCount: {
      type: NumberType,
      default: 0,
    },
  };
}
