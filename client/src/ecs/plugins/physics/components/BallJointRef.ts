import { StateComponent, RefType } from "~/ecs/base";

export class BallJointRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
