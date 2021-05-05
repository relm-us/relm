import { Group, AnimationClip, Object3D } from "three";
import { StateComponent, RefType } from "~/ecs/base";

export class ModelRef extends StateComponent {
  // A glTF loads a "scene" as the top-level group
  scene: Group;

  // Some glTFs have animations, which we may capture here
  animations: Array<AnimationClip>;

  static props = {
    scene: {
      type: RefType,
    },

    animations: {
      type: RefType,
    },
  };
}
