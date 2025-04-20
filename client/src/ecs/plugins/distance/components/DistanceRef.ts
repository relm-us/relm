import { NumberType, LocalComponent } from "~/ecs/base"

export class DistanceRef extends LocalComponent {
  value: number

  static props = {
    value: {
      type: NumberType,
      default: null,
    },
  }
}
