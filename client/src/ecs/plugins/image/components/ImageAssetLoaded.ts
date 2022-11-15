import type { Texture } from "three";

import { StateComponent, StringType, RefType } from "~/ecs/base";

export class ImageAssetLoaded extends StateComponent {
  value: Texture;

  // something to uniquely identify the asset, such as its URL
  cacheKey: string;

  // null if no error; otherwise, an explanation of the error
  error: string;

  static props = {
    value: { type: RefType },
    cacheKey: { type: StringType },
    error: { type: StringType, default: null },
  };
}
