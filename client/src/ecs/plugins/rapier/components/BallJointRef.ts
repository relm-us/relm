import { StateComponent, RefType } from "hecs";

export class BallJointRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
