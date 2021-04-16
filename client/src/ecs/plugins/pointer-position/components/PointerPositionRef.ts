import { StateComponent, RefType, NumberType } from "~/ecs/base";

export class PointerPositionRef extends StateComponent {
  static props = {
    value: {
      // reference to WorldPlanes
      type: RefType,
    },

    updateCount: {
      type: NumberType,
      default: 0,
    },
  };
}
