import type { Object3D } from "three"
import { StateComponent, RefType } from "~/ecs/base"

export class ChildAttachRef extends StateComponent {
  parent: Object3D
  child: Object3D

  static props = {
    parent: {
      type: RefType,
    },

    child: {
      type: RefType,
    },
  }
}
