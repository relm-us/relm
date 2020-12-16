import { Component, BooleanType } from "hecs";

export class PointerPlane extends Component {
  static props = {
    visible: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Visible",
      },
    },
  };
}
