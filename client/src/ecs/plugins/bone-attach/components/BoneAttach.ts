import { Vector3, type Quaternion } from "three"

import { LocalComponent, StringType } from "~/ecs/base"
import { QuaternionType, Vector3Type } from "~/ecs/plugins/core"

export class BoneAttach extends LocalComponent {
  boneName: string
  entityToAttachId: string

  position: Vector3
  rotation: Quaternion
  scale: Vector3

  static props = {
    boneName: {
      type: StringType,
      default: null,
    },

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
  }
}
