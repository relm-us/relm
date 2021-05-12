import { NumberType, StateComponent } from "~/ecs/base";

export class DistanceRef extends StateComponent {
  static props = {
    value: {
      type: NumberType,
      default: null
    }
  }
}
