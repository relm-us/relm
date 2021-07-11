import { Component, StringType, NumberType } from "~/ecs/base";
import { Vector2Type } from "~/ecs/plugins/core";
import { Vector2 } from "three";

export class CssPlane extends Component {
  kind: string;
  rectangleSize: Vector2;
  circleRadius: number;

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
      type: Vector2Type,
      default: new Vector2(1, 1),
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
    label: "CSS Plane",
  };

  getSize() {
    switch (this.kind) {
      case "RECTANGLE":
        return this.rectangleSize;
      case "CIRCLE":
        return new Vector2(this.circleRadius * 2, this.circleRadius * 2);
      default:
        return new Vector2(1, 1);
    }
  }

  getScreenSize(scale: number) {
    const size = this.getSize();
    return new Vector2(size.x / scale, size.y / scale);
  }
}
