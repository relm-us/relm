import { Vector3 } from "three";
import { StateComponent } from "~/ecs/base";

import { Vector3Type } from "../../core/types";

export class SpatiallyIndexed extends StateComponent {
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
