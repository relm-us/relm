import type { Object3D } from "three"
import { StateComponent, RefType } from "~/ecs/base"

export class BoneAttachRef extends StateComponent {
  bone: Object3D
  child: Object3D

  static props = {
    bone: {
      type: RefType,
    },

    child: {
      type: RefType,
    },
  }
}
