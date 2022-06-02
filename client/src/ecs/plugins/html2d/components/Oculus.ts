import {
  BooleanType,
  LocalComponent,
  NumberType,
  RefType,
  StringType,
} from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Oculus extends LocalComponent {
  offset: Vector3;
  targetOffset: Vector3;
  size: number;
  vanchor: number;
  hanchor: number;
  showAudio: boolean;
  showVideo: boolean;
  color: string;
  participantName: string;
  participantId: string;
  onChange: Function;

  static props = {
    offset: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Position Offset",
      },
    },

    targetOffset: {
      type: Vector3Type,
      default: new Vector3(),
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

    showAudio: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Show Audio?",
      },
    },

    showVideo: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Show Video?",
      },
    },

    color: {
      type: StringType,
      default: null,
    },

    participantName: {
      type: StringType,
      default: null,
    },

    // Set automatically. If equal to local playerId, Oculus will show own video stream.
    participantId: {
      type: StringType,
      default: null,
    },

    onChange: {
      type: RefType,
      default: null,
    },
  };
}
