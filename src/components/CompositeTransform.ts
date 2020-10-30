import { Component, JSONType } from "hecs";
import { Vector3Type, QuaternionType } from "hecs-plugin-core";
import { Vector3, Quaternion } from "three";

type TransformProperty = "position" | "scale" | "rotation";

/**
 * Provides the "CompositeTransform" transform of an object. For example, while
 * an object's Transform position may be at a specific location, other effects
 * can cause it to appear elsewhere. For example: bouncing, shaking, etc.
 */
export class CompositeTransform extends Component {
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
    offsets: {
      type: JSONType,
      default: {},
      editor: {
        label: "Offsets",
      },
    },
  };

  offset(id: string, property: TransformProperty, value: Vector3 | Quaternion) {
    // If needed, initialize an offset for this system on this entity
    if (!(id in this.offsets)) {
      this.offsets[id] = {};
    }

    if (!(property in this.offsets[id])) {
      let init;
      switch (property) {
        case "position":
        case "scale":
          init = new Vector3();
          break;
        case "rotation":
          init = new Quaternion();
      }
      this.offsets[id][property] = init;
    }

    this.offsets[id][property].copy(value);
  }
}
