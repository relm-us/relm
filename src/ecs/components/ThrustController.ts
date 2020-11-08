import { Component, StringType, NumberType } from "hecs";

export class ThrustController extends Component {
  static props = {
    plane: {
      type: StringType,
      default: "XZ",
      editor: {
        label: "Plane of Control",
        input: "Select",
        options: [
          { label: "XZ", value: "XZ" },
          { label: "XY", value: "XY" },
        ],
      },
    },

    thrust: {
      type: NumberType,
      default: 30.0,
      editor: {
        label: "Thrust Magnitude",
      },
    },
  };
}
