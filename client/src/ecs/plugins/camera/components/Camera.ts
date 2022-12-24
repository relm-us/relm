import { Spherical, Vector3 } from "three";

import { LocalComponent } from "~/ecs/base";
import { Vector3Type, SphericalType } from "~/ecs/plugins/core";

export class Camera extends LocalComponent {
  lookAt: Vector3;
  center: Vector3;
  sphere: Spherical;

  static props = {
    lookAt: {
      type: Vector3Type,
    },

    center: {
      type: Vector3Type,
    },

    sphere: {
      type: SphericalType,
      default: new Spherical(1, 0, 0),
    },
  };
}
