import { Vector3 } from "three"

import { Component, StringType, NumberType } from "~/ecs/base"
import { Vector3Type } from "~/ecs/plugins/core"

export class Wall extends Component {
  size: Vector3
  convexity: number
  segments: number
  color: string
  emissive: string
  roughness: number
  metalness: number

  static props = {
    size: {
      type: Vector3Type,
      default: new Vector3(3, 2, 0.25),
      editor: {
        label: "Size",
      },
    },

    convexity: {
      type: NumberType,
      default: 0.0,
      editor: {
        label: "Convexity",
        increment: 0.01,
      },
    },

    segments: {
      type: NumberType,
      default: 15,
      editor: {
        label: "Segments",
      },
    },

    color: {
      type: StringType,
      default: "#1e0b09",
      editor: {
        label: "Color",
        input: "Color",
      },
    },

    emissive: {
      type: StringType,
      default: "#000000",
      editor: {
        label: "Emissive Color",
        input: "Color",
      },
    },

    roughness: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "Roughness",
      },
    },

    metalness: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Metalness",
      },
    },
  }

  static editor = {
    label: "Wall",
  }
}
