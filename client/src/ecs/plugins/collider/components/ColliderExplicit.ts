import type { Collider, RigidBody } from "@dimforge/rapier3d";

import { StateComponent, RefType } from "~/ecs/base";

export class ColliderExplicit extends StateComponent {
  body: RigidBody;
  collider: Collider;

  static props = {
    body: {
      type: RefType,
    },

    collider: {
      type: RefType,
    },
  };
}
