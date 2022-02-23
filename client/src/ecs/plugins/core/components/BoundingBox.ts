import { Box3, Vector3 } from "three";

import { LocalComponent } from "~/ecs/base";

import { Box3Type, Vector3Type } from "../types";

export class BoundingBox extends LocalComponent {
  box: Box3;
  size: Vector3;

  static props = {
    box: {
      type: Box3Type,
      editor: {
        label: "Bounding Box",
      },
    },

    size: {
      type: Vector3Type,
      editor: {
        label: "Bounding Size",
      },
    },
  };
}
