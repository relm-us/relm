import { Vector3, Quaternion } from "three";

import { Component, StringType } from "~/ecs/base";
import { QuaternionType, Vector3Type } from "~/ecs/plugins/core";

export class Item extends Component {
  power: string;
  attach: string;

  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;

  static props = {
    power: {
      type: StringType,
      editor: {
        label: "Power",
      },
    },

    attach: {
      type: StringType,
      default: "HAND",
      editor: {
        label: "Attach To",
        input: "Select",
        options: [
          { label: "Head", value: "HEAD" },
          { label: "Back", value: "BACK" },
          { label: "Hips", value: "HIPS" },
          { label: "Right Hand", value: "RIGHT_HAND" },
          { label: "Left Hand", value: "LEFT_HAND" },
          { label: "Right Leg", value: "RIGHT_LEG" },
          { label: "Left Leg", value: "LEFT_LEG" },
          { label: "Right Foot", value: "RIGHT_FOOT" },
          { label: "Left Foot", value: "LEFT_FOOT" },
        ],
      },
    },

    position: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Held Position",
      },
    },

    rotation: {
      type: QuaternionType,
      default: new Quaternion(),
      editor: {
        label: "Held Rotation",
      },
    },

    scale: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: "Held Scale",
      },
    },
  };

  static editor = {
    label: "Item",
  };
}
