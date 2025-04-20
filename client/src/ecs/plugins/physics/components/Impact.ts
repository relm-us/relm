import { BooleanType, type Entity, LocalComponent, RefType } from "~/ecs/base"

export class Impact extends LocalComponent {
  other: Entity
  started: boolean

  static props = {
    other: {
      type: RefType,
    },

    started: {
      type: BooleanType,
    },
  }
}
