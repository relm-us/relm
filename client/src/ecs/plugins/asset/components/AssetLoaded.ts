import type { Texture } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import { StateComponent, StringType, RefType } from "~/ecs/base";

export class AssetLoaded extends StateComponent {
  kind: "TEXTURE" | "GLTF";
  value: Texture | GLTF;
  error: string;

  static props = {
    kind: {
      type: StringType,
    },

    value: {
      type: RefType,
    },

    error: {
      type: StringType,
      default: null,
    },
  };
}
