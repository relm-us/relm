import { LocalComponent, RefType } from "hecs";
import { Matrix4 } from "three";

export type EffectState = {
  matrix: Matrix4;
  state: object;
};

export class TransformEffectsStack extends LocalComponent {
  stack: Array<EffectState>;

  static props = {
    stack: {
      type: RefType,
    },
  };
}
