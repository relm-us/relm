import { LocalComponent, NumberType } from "~/ecs/base"

export class Outline extends LocalComponent {
  static props = {
    color: {
      type: NumberType,
      default: "white",
    },

    thickness: {
      type: NumberType,
      default: 2,
    },
  }
}
