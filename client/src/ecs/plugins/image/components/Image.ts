import { Component, StringType, NumberType } from "~/ecs/base";

export class Image extends Component {
  fit: "COVER" | "CONTAIN";
  width: number;
  height: number;

  static props = {
    fit: {
      type: StringType,
      default: "CONTAIN",
      editor: {
        label: "Fit",
        input: "Select",
        options: [
          { label: "Contain", value: "CONTAIN" },
          { label: "Cover", value: "COVER" },
        ],
      },
    },

    width: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Width",
      },
    },

    height: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Height",
      },
    },
  };

  static editor = {
    label: "Image",
  };
}
