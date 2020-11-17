import { StateComponent, RefType } from "hecs";

export class FixedJointRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
