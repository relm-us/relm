import { StateComponent, RefType } from "~/ecs/base";
import type { RigidBody as RapierRigidBody } from "@dimforge/rapier3d";

export class RigidBodyRef extends StateComponent {
  value: RapierRigidBody;

  static props = {
    value: {
      type: RefType,
    },
  };
}
