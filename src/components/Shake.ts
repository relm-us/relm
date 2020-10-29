import { Component, NumberType } from "hecs";
import { Vector3 } from "hecs-plugin-core";
import { Vector3Type } from "hecs-plugin-core";

export class Shake extends Component {
  static props = {
    speed: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Speed (distance per ms)",
      },
    },
    magnitude: {
      type: Vector3Type,
      default: new Vector3(0, 0, 1),
      editor: {
        label: "Magnitude",
      },
    },
  };
}
