import { Component, StringType, NumberType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Follow extends Component {
  target: string;
  offset: Vector3;
  lerpAlpha: number;

  // Calculated at run-time; the position we are lerping towards
  targetPosition: Vector3;

  static props = {
    target: {
      type: StringType,
      editor: {
        label: "Entity",
        input: "Entity",
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
      default: 0.075,
      editor: {
        label: "LERP Alpha",
      },
    },
  };
  
  static editor = {
    label: "Follow",
  };
}
