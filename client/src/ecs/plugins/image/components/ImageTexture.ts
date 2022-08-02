import { Texture } from "three";
import { StateComponent, RefType } from "~/ecs/base";

export class ImageTexture extends StateComponent {
  value: Texture;

  static props = {
    value: {
      type: RefType,
    },
  };
}
