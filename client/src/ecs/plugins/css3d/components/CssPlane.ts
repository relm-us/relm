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
      default: "ROUNDED",
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "Rectangle", value: "RECTANGLE" },
          { label: "Rounded Rect", value: "ROUNDED" },
          { label: "Circle", value: "CIRCLE" },
        ],
      },
    },

    rectangleSize: {
      type: Vector2Type,
      default: new Vector2(1, 1),
      editor: {
        label: "Size",
        requires: [
          { prop: "kind", value: "RECTANGLE" },
          { prop: "kind", value: "ROUNDED" },
        ],
      },
    },

    circleRadius: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "Radius",
        requires: [
          { prop: "kind", value: "CIRCLE" },
          { prop: "kind", value: "ROUNDED" },
        ],
      },
    },
  };

  static editor = {
    label: "CSS Plane",
  };

  getSize() {
    switch (this.kind) {
      case "RECTANGLE":
      case "ROUNDED":
        return this.rectangleSize;
      case "CIRCLE":
        return new Vector2(this.circleRadius * 2, this.circleRadius * 2);
      default:
        return new Vector2(1, 1);
    }
  }

  getScreenSize(scale: number) {
    const size = this.getSize();
    // Adding 2 pixels to width and height makes antialiasing smoother
    // because the size is "just larger" than the hole we poke through
    // the canvas3d; thus, we get a single antialiasing line rather than
    // two competing antialiasing lines
    return new Vector2(size.x / scale + 2, size.y / scale + 2);
  }
}
