import { LocalComponent } from "~/ecs/base";
import { Vector3Type, QuaternionType } from "~/ecs/plugins/core";

export class NetworkControl extends LocalComponent {
  static props = {
    position: {
      type: Vector3Type,
    },
    rotation: {
      type: QuaternionType,
    },
  };
}
