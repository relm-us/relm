import { Vector3 } from "three";
import { LocalComponent } from "~/ecs/base";

import { Vector3Type } from "../types";

export class SpatiallyIndexed extends LocalComponent {
  index: Vector3;

  static props = {
    index: {
      type: Vector3Type,
      editor: {
        label: "Indexed Coordinate",
      },
    },
  };
}
