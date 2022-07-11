import type { Collider, RigidBody } from "@dimforge/rapier3d";

import { LocalComponent, RefType } from "~/ecs/base";

export class Collider2Ref extends LocalComponent {
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
