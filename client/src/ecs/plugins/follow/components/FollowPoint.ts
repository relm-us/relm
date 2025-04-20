import type { Vector3 } from "three"

import { LocalComponent, NumberType } from "~/ecs/base"
import { Vector3Type } from "~/ecs/plugins/core"

export class FollowPoint extends LocalComponent {
  target: Vector3
  dampening: number

  static props = {
    target: {
      type: Vector3Type,
    },

    dampening: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Speed Dampening",
      },
    },
  }
}
