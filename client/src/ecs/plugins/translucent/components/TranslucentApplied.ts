import { Object3D } from "three";
import { LocalComponent, RefType, NumberType } from "~/ecs/base";

export class TranslucentApplied extends LocalComponent {
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
