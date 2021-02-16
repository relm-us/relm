import { Component, StringType, NumberType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Collider extends Component {
  static props = {
    shape: {
      type: StringType,
      default: "BOX",
      editor: {
        label: "Shape",
        input: "Select",
        options: [
          { label: "Box", value: "BOX" },
          { label: "Sphere", value: "SPHERE" },
          { label: "Cylinder", value: "CYLINDER" },
          { label: "Capsule", value: "CAPSULE" },
        ],
      },
    },

    /**
     * Box Properties
     */

    boxSize: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: "Size",
        requires: [{ prop: "shape", value: "BOX" }], // TODO: fix and re-test as it is broken
      },
    },

    /**
     * Sphere Properties
     */

    sphereRadius: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "Radius",
        requires: [{ prop: "shape", value: "SPHERE" }], // TODO: fix and re-test as it is broken
      },
    },

    /**
     * Cylinder Properties
     */

    cylinderRadius: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "Radius",
        requires: [{ prop: "shape", value: "CYLINDER" }],
      },
    },

    cylinderHeight: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Height",
        requires: [{ prop: "shape", value: "CYLINDER" }],
      },
    },

    cylinderSegments: {
      type: NumberType,
      default: 6,
      editor: {
        label: "Segments",
        requires: [{ prop: "shape", value: "CYLINDER" }],
      },
    },

    /**
     * Capsule Properties
     */

    capsuleRadius: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "Radius",
        requires: [{ prop: "shape", value: "CAPSULE" }],
      },
    },

    capsuleHeight: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Height",
        requires: [{ prop: "shape", value: "CAPSULE" }],
      },
    },

    /**
     * General Properties
     */

    density: {
      type: NumberType,
      default: 0.4,
      editor: {
        label: "Density",
      },
    },

    interaction: {
      type: NumberType,
      // Rapier3D has optional rules that allow groups of colliders to interact
      // See https://rapier.rs/javascript2d/globals.html#interactiongroups
      default: 0x00010001,
      editor: {
        label: "Collide in Build Mode",
        input: "Boolean",
        inputTrue: 0x00010003,
        inputFalse: 0x00010001,
      },
    },
  };

  static editor = {
    label: "Collider",
  };
}
