import { StateComponent, RefType } from "~/ecs/base"

export class YouTubeRef extends StateComponent {
  value: any

  static props = {
    value: {
      type: RefType,
    },
  }
}
