import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import { StateComponent, RefType } from "~/ecs/base";

export class Model2Ref extends StateComponent {
  value: GLTF;

  static props = {
    value: {
      type: RefType,
    },
  };
}
