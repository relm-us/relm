import { StateComponent, RefType } from "~/ecs/base"

export class ProjectorRef extends StateComponent {
  value: any

  static props = {
    value: {
      type: RefType,
    },
  }
}
