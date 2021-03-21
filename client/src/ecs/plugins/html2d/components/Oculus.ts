import { LocalComponent, NumberType, StringType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Oculus extends LocalComponent {
  static props = {
    offset: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Position Offset",
      },
    },

    size: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Size",
      },
    },

    vanchor: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Anchor (Vertical)",
        input: "Select",
        options: [
          { label: "Center", value: 0 },
          { label: "Top", value: 1 },
          { label: "Bottom", value: 2 },
        ],
      },
    },

    hanchor: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Anchor (Horz.)",
        input: "Select",
        options: [
          { label: "Center", value: 0 },
          { label: "Left", value: 1 },
          { label: "Right", value: 2 },
        ],
      },
    },

    // Set automatically. If equal to local playerId, Oculus will show own video stream.
    playerId: {
      type: StringType,
      default: null,
    },
  };
}
