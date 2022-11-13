import type { Texture } from "three";

import { StateComponent, RefType } from "~/ecs/base";

export class ShapeTexture extends StateComponent {
  // NOTE: can be null, if Asset is not a Texture
  value: Texture;

  static props = {
    value: {
      type: RefType,
    },
  };
}
