import { Component, StringType } from "~/ecs/base";
import { Vector3Type } from "../types";
import { Vector3 } from "three";

export class LookAt extends Component {
  static props = {
    target: {
      type: StringType,
      editor: {
        label: "Target Entity",
        input: "Entity",
      },
    },

    limit: {
      type: StringType,
      default: "NONE",
      editor: {
        label: "Limit",
        input: "Select",
        options: [
          { label: "None", value: "NONE" },
          { label: "X-Axis", value: "X_AXIS" },
          { label: "Y-Axis", value: "Y_AXIS" },
          { label: "Z-Axis", value: "Z_AXIS" },
        ],
      },
    },

    offset: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Target Offset",
      },
    },
  };

  static editor = {
    label: "Look At",
  };
}
