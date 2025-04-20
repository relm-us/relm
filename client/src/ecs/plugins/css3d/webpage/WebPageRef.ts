import { StateComponent, RefType } from "~/ecs/base"

export class WebPageRef extends StateComponent {
  value: any

  static props = {
    value: {
      type: RefType,
    },
  }
}
