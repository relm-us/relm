import { Component, StringType, NumberType } from "~/ecs/base"
import { Vector3Type } from "~/ecs/plugins/core"
import { Vector3 } from "three"

export class Follow extends Component {
  target: string
  offset: Vector3
  dampening: number

  // deprecated
  lerpAlpha: number

  static props = {
    target: {
      type: StringType,
      editor: {
        label: "Entity",
        input: "Entity",
      },
    },

    offset: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
      editor: {
        label: "Follow Offset",
      },
    },

    dampening: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Speed Dampening",
      },
    },

    // deprecated
    lerpAlpha: {
      type: NumberType,
      default: 0.075,
    },
  }

  static editor = {
    label: "Follow",
  }
}
