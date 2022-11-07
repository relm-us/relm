import {
  BooleanType,
  LocalComponent,
  NumberType,
  RefType,
  StringType,
} from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

const HTML2D_MOTION_THRESHOLD = 0.1;

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

  // Cached position values from OculusSystem
  x: number;
  y: number;
  diameter: number;

  // Cached tween values from OculusSystem
  tween: any;
  tweenedTargetOffset: Vector3;

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

    // Set automatically. If equal to local participantId, Oculus will show own video stream.
    participantId: {
      type: StringType,
      default: null,
    },

    onChange: {
      type: RefType,
      default: null,
    },
  };

  isCachedPositionInvalid(v1: Vector3, diameter: number) {
    return (
      this.x === undefined ||
      this.y === undefined ||
      this.diameter === undefined ||
      Math.abs(this.x - v1.x) >= HTML2D_MOTION_THRESHOLD ||
      Math.abs(this.y - v1.y) >= HTML2D_MOTION_THRESHOLD ||
      Math.abs(this.diameter - diameter) >= 1
    );
  }

  setCachedPosition(v1: Vector3, diameter: number) {
    this.x = v1.x;
    this.y = v1.y;
    this.diameter = diameter;
  }

  clearCache() {
    this.x = undefined;
    this.y = undefined;
    this.diameter = undefined;
  }
}
