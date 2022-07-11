import { LocalComponent, RefType, BooleanType, NumberType } from "~/ecs/base";

export class DiamondRef extends LocalComponent {
  static props = {
    diamond: {
      type: RefType,
    },

    glow: {
      type: RefType,
    },

    loaded: {
      type: BooleanType,
      default: false,
    },

    time: {
      type: NumberType,
      default: 0,
    },
  };
}
