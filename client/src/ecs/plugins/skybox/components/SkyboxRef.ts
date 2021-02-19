import { StateComponent, RefType, NumberType } from "~/ecs/base";

export class SkyboxRef extends StateComponent {
  static props = {
    texture: {
      type: RefType,
    },

    width: {
      type: NumberType,
    },

    height: {
      type: NumberType,
    },
  };
}
