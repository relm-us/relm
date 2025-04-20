import type { Object3D } from "three"
import { StateComponent, RefType } from "~/ecs/base"

export class BloomApplied extends StateComponent {
  object: Object3D

  static props = {
    object: {
      type: RefType,
    },
  }
}
