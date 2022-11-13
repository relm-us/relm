import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import { StateComponent, RefType, Entity } from "~/ecs/base";

export class ModelRef extends StateComponent {
  value: GLTF;
  errorEntity: Entity;

  static props = {
    value: {
      type: RefType,
    },

    errorEntity: {
      type: RefType,
    },
  };
}
