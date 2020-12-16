import { LocalComponent, StringType, NumberType } from "hecs";

export class ThrustController extends LocalComponent {
  static props = {
    thrust: {
      type: NumberType,
      default: 50.0,
      editor: {
        label: "Thrust Magnitude",
      },
    },
    torque: {
      type: NumberType,
      default: 8.0,
      editor: {
        label: "Thrust Magnitude",
      },
    },
  };
}
