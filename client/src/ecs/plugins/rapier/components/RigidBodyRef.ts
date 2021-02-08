import { StateComponent, RefType } from "~/ecs/base";

export class RigidBodyRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
