import { Component, RefType } from "hecs";
import { Vector3Type, Vector3 } from "hecs-plugin-core";

export class PointerPlaneRef extends Component {
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
  };
}
