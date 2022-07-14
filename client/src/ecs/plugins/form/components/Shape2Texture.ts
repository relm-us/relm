import type { Texture } from "three";

import { StateComponent, RefType } from "~/ecs/base";

export class Shape2Texture extends StateComponent {
  // NOTE: can be null, if Asset is not a Texture
  value: Texture;

  static props = {
    value: {
      type: RefType,
    },
  };
}
