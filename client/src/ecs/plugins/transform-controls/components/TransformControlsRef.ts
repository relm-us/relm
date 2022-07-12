import { TransformControls as ThreeTransformControls } from "three/examples/jsm/controls/TransformControls";
import { StateComponent, RefType } from "~/ecs/base";

export class TransformControlsRef extends StateComponent {
  value: ThreeTransformControls;

  static props = {
    value: {
      type: RefType,
    },
  };
}
