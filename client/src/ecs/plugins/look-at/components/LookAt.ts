import { BooleanType, Component, NumberType, StringType } from "~/ecs/base"
import { Vector3Type } from "~/ecs/plugins/core"
import { Vector3 } from "three"

export class LookAt extends Component {
  target: string
  limit: string
  offset: Vector3
  stepRadians: number
  oneShot: boolean

  static props = {
    target: {
      type: StringType,
      editor: {
        label: "Target Entity",
        input: "Entity",
      },
    },

    limit: {
      type: StringType,
      default: "NONE",
      editor: {
        label: "Limit",
        input: "Select",
        options: [
          { label: "None", value: "NONE" },
          { label: "X-Axis", value: "X_AXIS" },
          { label: "Y-Axis", value: "Y_AXIS" },
          { label: "Z-Axis", value: "Z_AXIS" },
        ],
      },
    },

    offset: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Target Offset",
      },
    },

    // Angle to rotate per frame; 0 is instantaneous
    stepRadians: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Angle Step",
      },
    },

    oneShot: {
      type: BooleanType,
      default: false,
      editor: {
        label: "One Shot",
      },
    },
  }

  static editor = {
    label: "Look At",
  }
}
