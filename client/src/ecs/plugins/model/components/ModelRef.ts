import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

import { StateComponent, RefType, type Entity, BooleanType } from "~/ecs/base"

export class ModelRef extends StateComponent {
  value: GLTF
  needsReload: boolean
  errorEntity: Entity

  static props = {
    value: { type: RefType },

    needsReload: { type: BooleanType },

    errorEntity: { type: RefType },
  }
}
