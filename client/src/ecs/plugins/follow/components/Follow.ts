import { Component, StringType, NumberType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Follow extends Component {
  entity: string;
  limit: string;
  offset: Vector3;
  lerpAlpha: number;

  static props = {
    entity: {
      type: StringType,
      editor: {
        label: "Entity",
        input: "Entity",
      },
    },
    limit: {
      type: StringType,
      default: "XYZ_AXIS",
      editor: {
        label: "Limit",
        input: "Select",
        options: [
          { label: "X-Axis", value: "X_AXIS" },
          { label: "Y-Axis", value: "Y_AXIS" },
          { label: "Z-Axis", value: "Z_AXIS" },
        ],
      },
    },
    offset: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
      editor: {
        label: "Follow Offset",
      },
    },
    lerpAlpha: {
      type: NumberType,
      default: 0.03,
      editor: {
        label: "LERP Alpha",
      },
    },
  };
  
  static editor = {
    label: "Follow",
  };
}
