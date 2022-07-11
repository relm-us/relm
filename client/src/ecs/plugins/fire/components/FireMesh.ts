import { LocalComponent, RefType, BooleanType, NumberType } from "~/ecs/base";

export class FireMesh extends LocalComponent {
  static props = {
    value: {
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
