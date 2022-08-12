import { BooleanType, NumberType, RefType, LocalComponent } from "~/ecs/base";
import { Vector3 } from "three";
import { Vector3Type } from "~/ecs/plugins/core";

export class ControllerState extends LocalComponent {
  speed: number;
  grounded: boolean;
  direction: Vector3;
  animOverride: { clipName: string; loop: boolean };

  static props = {
    speed: {
      type: NumberType,
      default: 0,
    },
    grounded: {
      type: BooleanType,
      default: true,
    },
    direction: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
    },
    animOverride: {
      type: RefType,
      default: null,
    },
  };
}
