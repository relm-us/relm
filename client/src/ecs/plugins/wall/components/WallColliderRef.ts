import type { Collider } from "@dimforge/rapier3d"
import { RefType, StateComponent } from "~/ecs/base"

export class WallColliderRef extends StateComponent {
  value: Collider

  static props = {
    value: {
      type: RefType,
    },
  }
}
