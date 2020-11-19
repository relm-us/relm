import { Component, StringType, BooleanType } from "hecs";

export class HeadController extends Component {
  static props = {
    pointerPlaneEntity: {
      type: StringType,
      editor: {
        label: "Entity with Pointer Plane",
        input: "Entity",
      },
    },
    enabled: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Enabled",
      },
    },
  };
}
