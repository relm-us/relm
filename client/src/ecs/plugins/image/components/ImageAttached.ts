import { Object3D, Group } from "three";
import { LocalComponent, RefType } from "~/ecs/base";

export class ImageAttached extends LocalComponent {
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
