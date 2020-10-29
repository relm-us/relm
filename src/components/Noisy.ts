import { Component, NumberType, StringType } from "hecs";
import { Vector3, Vector3Type } from "hecs-plugin-core";

export type NoisyProperty = "position" | "rotation" | "scale";

export class Noisy extends Component {
  static props = {
    property: {
      type: StringType,
      default: "position",
      editor: {
        label: "Property to Add Noise To",
        input: "Select",
        options: [
          { label: "Position", value: "position" },
          { label: "Rotation", value: "rotation" },
          { label: "Scale", value: "scale" },
        ],
      },
    },
    speed: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Speed",
      },
    },
    magnitude: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: "Magnitude",
      },
    },
  };
}
