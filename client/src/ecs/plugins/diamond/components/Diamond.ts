import { Component, NumberType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Diamond extends Component {
  static props = {
    speed: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Speed",
      },
    },

    offset: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
      editor: {
        label: "Offset",
      },
    },
  };

  static editor = {
    label: "Diamond",
  };
}
