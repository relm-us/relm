import { StateComponent, RefType, BooleanType, NumberType } from "~/ecs/base"

export class DiamondRef extends StateComponent {
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
  }
}
