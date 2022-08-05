import { Component, NumberType, StringType } from "~/ecs/base";

export class Spin extends Component {
  speed: number;
  axis: "X" | "Y" | "Z";

  static props = {
    speed: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Speed (hz)",
      },
    },

    axis: {
      type: StringType,
      default: "Y",
      editor: {
        label: "Axis",
        input: "Select",
        options: [
          { label: "X-Axis", value: "X" },
          { label: "Y-Axis", value: "Y" },
          { label: "Z-Axis", value: "Z" },
        ],
      },
    },
  };

  static editor = {
    label: "Spin",
  };
}
