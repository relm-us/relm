import { Vector3, Quaternion } from "three";

import { Component, NumberType } from "~/ecs/base";
import { QuaternionType, Vector3Type } from "~/ecs/plugins/core";

export class Seat extends Component {
  offset: Vector3;
  forward: Quaternion;
  swivel: number;

  static props = {
    offset: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Offset",
      },
    },

    forward: {
      type: QuaternionType,
      default: new Quaternion(),
      editor: {
        label: "Forward Facing Dir",
      },
    },

    swivel: {
      type: NumberType,
      default: null,
      editor: {
        label: "Swivel Range (deg)",
      },
    },
  };

  static editor = {
    label: "Seat",
  };
}
