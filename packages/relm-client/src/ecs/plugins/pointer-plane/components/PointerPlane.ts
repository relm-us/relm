import { Component, StringType } from "hecs";

export class PointerPlane extends Component {
  static props = {
    visible: {
      type: StringType,
      default: null,
      editor: {
        label: "Visible Plane",
        input: "Select",
        options: [
          { label: "None", value: null },
          { label: "XY Plane", value: "XY" },
          { label: "XZ Plane", value: "XZ" },
        ],
      },
    },
  };
}
