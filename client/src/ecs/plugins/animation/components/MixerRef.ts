import { AnimationAction, AnimationMixer } from "three";
import { LocalComponent, RefType } from "~/ecs/base";

export class MixerRef extends LocalComponent {
  value: AnimationMixer;
  activeAction: AnimationAction;
  previousAction: AnimationAction;

  static props = {
    value: {
      type: RefType,
    },
  };
}
