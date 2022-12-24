import { Vector3 } from "three";

import { Component, NumberType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";

export class CameraGravity extends Component {
  mass: number;
  offset: Vector3;

  static props = {
    mass: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Mass",
      },
    },

    offset: {
      type: Vector3Type,
      editor: {
        label: "Offset",
      },
    },
  };

  static editor = {
    label: "Camera Gravity",
  };
}
