import type { Object3D } from "three"
import { StateComponent, RefType } from "~/ecs/base"

export class Object3DRef extends StateComponent {
  value: Object3D

  static props = {
    value: {
      type: RefType,
    },
  }
}
