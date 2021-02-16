import { StateComponent, RefType, NumberType } from "~/ecs/base";

export class FireMesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },

    time: {
      type: NumberType,
      default: 0,
    },
  };
}
