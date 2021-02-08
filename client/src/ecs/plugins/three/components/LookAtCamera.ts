import { Component, StringType } from "~/ecs/base";

export class LookAtCamera extends Component {
  static props = {
    limit: {
      type: StringType,
      default: "NONE",
      editor: {
        label: "Limit",
        input: "Select",
        options: [
          { label: "None", value: "NONE" },
          { label: "X-Axis", value: "X_AXIS" },
          { label: "Y-Axis", value: "Y_AXIS" },
          { label: "Z-Axis", value: "Z_AXIS" },
        ],
      },
    },
  };
  static editor = {
    label: "Look At Camera",
  };
}
