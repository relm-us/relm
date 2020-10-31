import { StateComponent, RefType } from "hecs";

export class RigidBodyRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
