import { Component, NumberType, StringType } from "hecs";
import { Vector3 } from "hecs-plugin-core";
import { Vector3Type } from "hecs-plugin-core";

export class Oscillate extends Component {
  static props = {
    behavior: {
      type: StringType,
      default: "OSCILLATE",
      editor: {
        label: "Oscillate Behavior",
        input: "Select",
        options: [
          { label: "Oscillate", value: "OSCILLATE" },
          { label: "Bounce", value: "BOUNCE" },
          { label: "Hard Bounce", value: "HARD_BOUNCE" },
        ],
      },
    },
    phase: {
      type: NumberType,
      default: 0.0,
      editor: {
        label: "Starting angle",
      },
    },
    speed: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Speed (distance per ms)",
      },
    },
    direction: {
      type: Vector3Type,
      default: new Vector3(0, 1, 0),
      editor: {
        label: "Direction",
      },
    },
  };
}
