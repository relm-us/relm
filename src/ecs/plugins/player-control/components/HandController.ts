import { Component, StringType, RefType } from "hecs";

export class HandController extends Component {
  static props = {
    pointerPlaneEntity: {
      type: StringType,
      editor: {
        label: "Entity with Pointer Plane",
        input: "Entity",
      },
    },
    keyStore: {
      type: RefType,
      editor: {
        label: "Key Binding",
        input: "Keyboard",
      },
    },
  };
}
