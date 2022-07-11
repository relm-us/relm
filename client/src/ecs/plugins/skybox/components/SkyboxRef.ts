import { LocalComponent, RefType, NumberType } from "~/ecs/base";

export class SkyboxRef extends LocalComponent {
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
