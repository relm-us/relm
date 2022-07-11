import { LocalComponent, RefType } from "~/ecs/base";

export class BallJointRef extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
