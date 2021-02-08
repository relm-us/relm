import { Component, BooleanType } from "~/ecs/base";

// Indicate that the mesh SHOULD be centered
export class NormalizeMesh extends Component {
  static props = {
    position: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Center Position?",
      },
    },
    scale: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Normalize Scale?",
      },
    },
  };
}
