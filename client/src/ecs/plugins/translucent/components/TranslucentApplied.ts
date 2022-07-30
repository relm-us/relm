import { Object3D } from "three";
import { LocalComponent, RefType, NumberType, StringType } from "~/ecs/base";

export class TranslucentApplied extends LocalComponent {
  value: Object3D;
  currentOpacity: number;
  direction: "START" | "END";

  static props = {
    value: {
      type: RefType,
    },

    currentOpacity: {
      type: NumberType,
    },

    direction: {
      type: StringType,
      default: "START",
    },
  };
}
