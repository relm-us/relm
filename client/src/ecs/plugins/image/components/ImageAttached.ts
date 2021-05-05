import { Object3D, Group } from "three";
import { StateComponent, RefType } from "~/ecs/base";

export class ImageAttached extends StateComponent {
  parent: Object3D;
  scene: Group;

  static props = {
    parent: {
      type: RefType,
    },

    child: {
      type: RefType,
    },
  };
}
