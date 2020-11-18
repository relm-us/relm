import { Component, StringType, RefType } from "hecs";

export class HeadController extends Component {
  static props = {
    pointerPlaneEntity: {
      type: StringType,
      editor: {
        label: "Entity with Pointer Plane",
        input: "Entity",
      },
    },
  };
}
