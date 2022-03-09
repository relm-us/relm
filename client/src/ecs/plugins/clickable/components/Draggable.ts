import { Component, StringType, JSONType, NumberType } from "~/ecs/base";

export class Draggable extends Component {
  plane: "XZ" | "XY";

  static props = {
    plane: {
      type: StringType,
      default: "XZ",
      editor: {
        label: "plane",
        input: "Select",
        options: [
          { label: "XZ Plane", value: "XZ" },
          { label: "XY Plane", value: "XY" },
        ],
      },
    },
  };

  static editor = {
    label: "Draggable",
  };
}
