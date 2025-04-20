import { Component, NumberType, StringType } from "~/ecs/base"

export class PhysicsOptions extends Component {
  // Linear damping
  linDamp: number

  // Angular damping
  angDamp: number

  // Additional Mass (beyond collider mass)
  additionalMass: number

  // Rotation restrictions
  // e.g. "Y" would restrict rotations to only the Y axis
  rotRestrict: string

  // Ratio to scale gravity; 1 is "normal"
  gravityScale: number

  static props = {
    additionalMass: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Additional Mass",
      },
    },

    linDamp: {
      type: NumberType,
      default: 0.1,
      editor: {
        label: "Linear Damping",
      },
    },

    angDamp: {
      type: NumberType,
      default: 0.1,
      editor: {
        label: "Angular Damping",
      },
    },

    rotRestrict: {
      type: StringType,
      default: "XYZ",
      editor: {
        label: "Rotation Restrictions",
      },
    },

    gravityScale: {
      type: NumberType,
      default: 0,
    },
  }
}
