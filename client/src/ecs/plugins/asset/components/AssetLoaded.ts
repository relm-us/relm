import type { Texture } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import { StateComponent, StringType, RefType } from "~/ecs/base";

export class AssetLoaded extends StateComponent {
  kind: "TEXTURE" | "GLTF";

  // if an image, then Texture (for Shape); if a glTF, then GLTF (for Model)
  value: Texture | GLTF;

  // something to uniquely identify the asset, such as its URL
  cacheKey: string;

  // null if no error; otherwise, an explanation of the error
  error: string;

  static props = {
    kind: {
      type: StringType,
    },

    value: {
      type: RefType,
    },

    cacheKey: {
      type: StringType
    },

    error: {
      type: StringType,
      default: null,
    },
  };
}
