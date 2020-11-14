import { Component, StringType } from "hecs";

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
  };
  static editor = {
    label: "Follow",
  };
}
