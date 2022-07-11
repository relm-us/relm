import { NumberType, LocalComponent } from "~/ecs/base";

export class DistanceRef extends LocalComponent {
  static props = {
    value: {
      type: NumberType,
      default: null
    }
  }
}
