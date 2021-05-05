import { Object3D, Group } from "three";
import { StateComponent, RefType } from "~/ecs/base";

export class ModelAttached extends StateComponent {
  parent: Object3D;
  scene: Group;

  static props = {
    parent: {
      type: RefType,
    },

    scene: {
      type: RefType,
    },
  };
}
