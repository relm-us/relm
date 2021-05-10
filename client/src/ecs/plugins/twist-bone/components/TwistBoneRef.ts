import { Object3D } from "three";
import { StateComponent, RefType } from "~/ecs/base";

export class TwistBoneRef extends StateComponent {
  value: Object3D;
  parent: Object3D;

  static props = {
    value: {
      type: RefType,
    },

    parent: {
      type: RefType,
    },
  };
}
