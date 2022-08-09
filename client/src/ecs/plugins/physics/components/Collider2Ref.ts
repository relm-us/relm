import type { Collider, RigidBody } from "@dimforge/rapier3d";
import type { Vector3 } from "three";

import { LocalComponent, RefType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";

export class Collider2Ref extends LocalComponent {
  body: RigidBody;
  collider: Collider;
  size: Vector3;

  static props = {
    body: {
      type: RefType,
    },

    collider: {
      type: RefType,
    },

    size: {
      type: Vector3Type,
    },
  };
}
