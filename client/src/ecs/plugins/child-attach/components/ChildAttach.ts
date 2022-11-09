import { Vector3, Quaternion } from "three";

import { LocalComponent, StringType } from "~/ecs/base";
import { QuaternionType, Vector3Type } from "~/ecs/plugins/core";

export class ChildAttach extends LocalComponent {
  entityToAttachId: string;

  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;

  static props = {
    position: {
      type: Vector3Type,
    },

    rotation: {
      type: QuaternionType,
    },

    scale: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
    },

    entityToAttachId: {
      type: StringType,
    },
  };
}
