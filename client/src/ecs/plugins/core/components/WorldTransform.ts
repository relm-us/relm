import { LocalComponent } from "~/ecs/base";
import { Vector3Type, QuaternionType } from "../types";
import { Vector3 } from "three";

export class WorldTransform extends LocalComponent {
  static props = {
    position: {
      type: Vector3Type,
      editor: {
        label: "Position",
      },
    },
    rotation: {
      type: QuaternionType,
      editor: {
        label: "Rotation",
      },
    },
    scale: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: "Scale",
      },
    },
  };
}
