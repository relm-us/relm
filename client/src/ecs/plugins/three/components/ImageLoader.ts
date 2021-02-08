import { StateComponent, NumberType, RefType } from "~/ecs/base";

export class ImageLoader extends StateComponent {
  static props = {
    id: {
      type: NumberType,
    },
    texture: {
      type: RefType,
    },
  };
}
