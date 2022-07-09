import { Component, NumberType, StringType } from "~/ecs/base";

export class PhysicsOptions extends Component {
  // Linear damping
  linDamp: number;

  // Angular damping
  angDamp: number;

  // Rotation restrictions
  // e.g. "Y" would restrict rotations to only the Y axis
  rotRestrict: string;

  static props = {
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
  };
}
