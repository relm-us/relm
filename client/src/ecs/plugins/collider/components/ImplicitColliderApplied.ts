import type { Collider, RigidBody } from "@dimforge/rapier3d"

import { RefType, StateComponent } from "~/ecs/base"

export class ImplicitColliderApplied extends StateComponent {
  body: RigidBody
  collider: Collider

  static props = {
    body: {
      type: RefType,
    },

    collider: {
      type: RefType,
    },
  }
}
