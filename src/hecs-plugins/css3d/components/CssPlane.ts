import { Component, StringType, NumberType } from "hecs";
import { Vector3Type, Vector3 } from "hecs-plugin-core";

export class CssPlane extends Component {
  static props = {
    kind: {
      type: StringType,
      default: "RECTANGLE",
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "Rectangle", value: "RECTANGLE" },
          { label: "Circle", value: "CIRCLE" },
        ],
      },
    },

    rectangleSize: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: "Size",
        requires: [{ prop: "kind", value: "RECTANGLE" }],
      },
    },

    circleRadius: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "Radius",
        requires: [{ prop: "kind", value: "CIRCLE" }],
      },
    },
  };

  static editor = {
    label: "CssPlane",
  };
}
