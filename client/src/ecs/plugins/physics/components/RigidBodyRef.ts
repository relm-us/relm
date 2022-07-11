import type { RigidBody as RapierRigidBody } from "@dimforge/rapier3d";

import { LocalComponent, RefType } from "~/ecs/base";

export class RigidBodyRef extends LocalComponent {
  value: RapierRigidBody;

  static props = {
    value: {
      type: RefType,
    },
  };
}
