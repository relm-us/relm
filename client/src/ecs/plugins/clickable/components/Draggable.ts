import { Vector2 } from "three";
import { Component, StringType, NumberType, BooleanType } from "~/ecs/base";
import { Vector2Type } from "../../core";

export class Draggable extends Component {
  plane: "XZ" | "XY";

  grid: boolean;
  gridSize: number;
  gridOffset: Vector2;

  static props = {
    plane: {
      type: StringType,
      default: "XZ",
      editor: {
        label: "Plane",
        input: "Select",
        options: [
          { label: "XZ Plane", value: "XZ" },
          { label: "XY Plane", value: "XY" },
        ],
      },
    },

    grid: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Snap to Grid?",
      },
    },

    gridSize: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "Grid Cell Size",
        requires: [{ prop: "grid", value: true }],
      },
    },

    gridOffset: {
      type: Vector2Type,
      editor: {
        label: "Grid Offset",
        requires: [{ prop: "grid", value: true }],
      },
    },
  };

  static editor = {
    label: "Draggable",
  };
}
