import { StateComponent, NumberType, RefType } from "~/ecs/base";

export class BetterImageLoader extends StateComponent {
  static props = {
    id: {
      type: NumberType,
    },
    texture: {
      type: RefType,
    },
  };
}
