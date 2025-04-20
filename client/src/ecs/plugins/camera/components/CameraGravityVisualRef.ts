import type { Object3D } from "three"
import { StateComponent, RefType } from "~/ecs/base"

export class CameraGravityVisualRef extends StateComponent {
  object: Object3D

  static props = {
    object: {
      type: RefType,
    },
  }
}
