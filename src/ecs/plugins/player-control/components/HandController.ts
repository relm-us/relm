import { Component, StringType, NumberType } from "hecs";

export class HandController extends Component {
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
