import { Vector3, Quaternion } from "three"

import { Component, NumberType, StringType } from "~/ecs/base"
import { QuaternionType, Vector3Type } from "~/ecs/plugins/core"

export class Seat extends Component {
  offset: Vector3
  forward: Quaternion
  swivel: number
  zone: string

  // temp tracker, indicates if this seat is occupied
  seated: boolean

  static props = {
    offset: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Offset",
      },
    },

    forward: {
      type: QuaternionType,
      default: new Quaternion(),
      editor: {
        label: "Forward Facing Dir",
      },
    },

    swivel: {
      type: NumberType,
      default: null,
      editor: {
        label: "Swivel Range (deg)",
      },
    },

    zone: {
      type: StringType,
      default: "",
      editor: {
        label: "Audio Zone",
      },
    },
  }

  static editor = {
    label: "Seat",
  }
}
