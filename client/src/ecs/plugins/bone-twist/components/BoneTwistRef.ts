import type { Object3D } from "three"
import { LocalComponent, RefType } from "~/ecs/base"

export class BoneTwistRef extends LocalComponent {
  value: Object3D
  parent: Object3D

  static props = {
    value: {
      type: RefType,
    },

    parent: {
      type: RefType,
    },
  }
}
