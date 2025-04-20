import { LocalComponent, RefType } from "~/ecs/base"

export class DirectionalLightRef extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  }
}
