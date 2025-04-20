import { type Spherical, Vector2 } from "three"

import { Component, NumberType } from "~/ecs/base"
import { Vector2Type, SphericalType } from "~/ecs/plugins/core"

export class CameraGravity extends Component {
  mass: number
  range: Vector2
  sphere: Spherical

  static props = {
    mass: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Mass",
      },
    },

    range: {
      type: Vector2Type,
      default: new Vector2(5, 7),
      editor: {
        label: "Range (radius)",
        requires: [{ prop: "sphere", labels: ["inner", "outer"] }],
      },
    },

    sphere: {
      type: SphericalType,
      editor: {
        label: "Spherical Offset",
      },
    },
  }

  static editor = {
    label: "Camera Gravity",
  }
}
