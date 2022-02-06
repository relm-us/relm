import { Vector3Type, QuaternionType } from "~/ecs/plugins/core";
import { Quaternion, Vector3 } from "three";

import { LocalComponent, NumberType, StringType } from "~/ecs/base";

export class Transition extends LocalComponent {
  position: Vector3;
  positionSpeed: number; /* 0 to 1 */

  rotation: Quaternion;
  rotationSpeed: number; /* 0 to 1 */

  scale: Vector3;
  scaleSpeed: number; /* 0 to 1 */

  static props = {
    position: {
      type: Vector3Type,
      default: null,
    },

    positionSpeed: {
      type: NumberType,
      default: 0,
    },

    rotation: {
      type: QuaternionType,
      default: null,
    },

    rotationSpeed: {
      type: NumberType,
      default: 0,
    },

    scale: {
      type: Vector3Type,
      default: null,
    },

    scaleLerp: {
      type: NumberType,
      default: 0,
    },
  };
}
