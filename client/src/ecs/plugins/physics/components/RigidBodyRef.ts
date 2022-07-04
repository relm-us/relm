import { StateComponent, RefType } from "~/ecs/base";
import type { RigidBody as RapierRigidBody, Vector } from "@dimforge/rapier3d";

export type Action = {
  ref: RigidBodyRef;
  name: string;
  args: Array<any>;
};
export class RigidBodyRef extends StateComponent {
  value: RapierRigidBody;

  static actions: Array<Action> = [];

  static props = {
    value: {
      type: RefType,
    },
  };

  applyForce(force: Vector, wakeUp: boolean) {
    RigidBodyRef.actions.push({
      ref: this,
      name: "addForce",
      args: [force, wakeUp],
    });
  }

  applyTorque(force: Vector, wakeUp: boolean) {
    RigidBodyRef.actions.push({
      ref: this,
      name: "addTorque",
      args: [force, wakeUp],
    });
  }
}
