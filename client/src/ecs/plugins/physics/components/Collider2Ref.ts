import { StateComponent, RefType } from "~/ecs/base";
import type { Collider, RigidBody } from "@dimforge/rapier3d";

export class Collider2Ref extends StateComponent {
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
