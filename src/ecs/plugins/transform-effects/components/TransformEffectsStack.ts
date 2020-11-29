import { StateComponent, RefType } from "hecs";
import { Matrix4 } from "three";

export type EffectState = {
  matrix: Matrix4;
  state: object;
};

export class TransformEffectsStack extends StateComponent {
  stack: Array<EffectState>;

  static props = {
    stack: {
      type: RefType,
    },
  };
}
