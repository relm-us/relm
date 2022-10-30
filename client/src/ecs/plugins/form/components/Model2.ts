import { Vector3 } from "three";
import { BooleanType, Component } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";

export class Model2 extends Component {
  compat: boolean;
  offset: Vector3;

  static props = {
    compat: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Compatibility Mode",
      },
    },

    offset: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
    },
  };

  static editor = {
    label: "Model",
  };
}
