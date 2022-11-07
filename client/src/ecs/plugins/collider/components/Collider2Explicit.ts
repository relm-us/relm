import type { Collider, RigidBody } from "@dimforge/rapier3d";

import { StateComponent, RefType } from "~/ecs/base";

export class Collider2Explicit extends StateComponent {
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
