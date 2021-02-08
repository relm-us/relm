import { StateComponent, RefType, NumberType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";
export class PointerPlaneRef extends StateComponent {
  static props = {
    planes: {
      type: RefType,
      editor: {
        label: "Array of Planes",
      },
    },
    XY: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Pointer Coordinate on XY Plane",
      },
    },
    XZ: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Pointer Coordinate on XZ Plane",
      },
    },
    updateCount: {
      type: NumberType,
      default: 0,
    },
  };
}
