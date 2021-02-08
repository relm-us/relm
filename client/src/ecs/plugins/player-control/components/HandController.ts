import { LocalComponent, StringType, RefType } from "~/ecs/base";

export class HandController extends LocalComponent {
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
