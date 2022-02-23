import { Object3D } from "three";
import { StateComponent, RefType, NumberType } from "~/ecs/base";

export class TranslucentApplied extends StateComponent {
  value: Object3D;
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
