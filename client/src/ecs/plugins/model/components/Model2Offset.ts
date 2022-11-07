import { Vector3 } from "three";
import { LocalComponent } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";

export class Model2Offset extends LocalComponent {
  offset: Vector3;

  static props = {
    targetOffset: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
    },

    offset: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
    },
  };
}
