import { Component, JSONType } from "hecs";
import { Vector3, Vector3Type, QuaternionType } from "hecs-plugin-core";

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

  setCompositePosition(id, position) {
    // If needed, initialize an offset for this system on this entity
    if (!(id in this.offsets)) {
      this.offsets[id] = {};
    }

    if (!("position" in this.offsets[id])) {
      this.offsets[id].position = new Vector3();
    }

    this.offsets[id].position.copy(position);
  }

  setCompositeScale(id, scale) {
    // If needed, initialize an offset for this system on this entity
    if (!(id in this.offsets)) {
      this.offsets[id] = {};
    }

    if (!("scale" in this.offsets[id])) {
      this.offsets[id].scale = new Vector3();
    }

    this.offsets[id].scale.copy(scale);
  }
}
