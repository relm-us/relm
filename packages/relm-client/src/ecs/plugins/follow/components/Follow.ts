import { Component, StringType, NumberType } from "hecs";
import { Vector3, Vector3Type } from "hecs-plugin-core";

export class Follow extends Component {
  static props = {
    entity: {
      type: StringType,
      editor: {
        label: "Entity",
        input: "Entity",
      },
    },
    limit: {
      type: StringType,
      default: "X_AXIS",
      editor: {
        label: "Limit",
        input: "Select",
        options: [
          { label: "X-Axis", value: "X_AXIS" },
          { label: "Y-Axis", value: "Y_AXIS" },
          { label: "Z-Axis", value: "Z_AXIS" },
        ],
      },
    },
    offset: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
      editor: {
        label: "Follow Offset",
      },
    },
    lerpAlpha: {
      type: NumberType,
      default: 0.03,
      editor: {
        label: "LERP Alpha",
      },
    },
  };
  static editor = {
    label: "Follow",
  };
}
