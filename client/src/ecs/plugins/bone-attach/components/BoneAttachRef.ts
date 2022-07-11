import { Object3D } from "three";
import { LocalComponent, RefType } from "~/ecs/base";

export class BoneAttachRef extends LocalComponent {
  bone: Object3D;
  child: Object3D;

  static props = {
    bone: {
      type: RefType,
    },

    child: {
      type: RefType,
    },
  };
}
