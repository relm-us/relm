import { StateComponent, RefType } from "~/ecs/base"

export class DocumentRef extends StateComponent {
  value: any

  static props = {
    value: {
      type: RefType,
    },
  }
}
