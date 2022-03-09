import { Component, StringType, JSONType, NumberType } from "~/ecs/base";

export class Draggable extends Component {
  plane: "XZ" | "XY" | "YZ";

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
          { label: "YZ Plane", value: "YZ" },
        ],
      },
    },
  };

  static editor = {
    label: "Draggable",
  };
}
