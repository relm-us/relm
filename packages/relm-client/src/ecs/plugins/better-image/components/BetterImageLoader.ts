import { StateComponent, NumberType, RefType } from "hecs";

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
