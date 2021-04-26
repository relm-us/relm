import { Vector3Type } from "~/ecs/plugins/core";
import { LocalComponent } from "~/ecs/base";

export class PointerPosition extends LocalComponent {
  static props = {
    offset: {
      type: Vector3Type,
    },
  };
}
