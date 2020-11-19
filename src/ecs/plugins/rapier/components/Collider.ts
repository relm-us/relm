import { Component, StringType, NumberType } from "hecs";
import { Vector3, Vector3Type } from "hecs-plugin-core";

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
          { label: "Capsule", value: "CAPSULE" },
        ],
      },
    },

    density: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Density",
      },
    },

    boxSize: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: "Size",
        requires: [{ prop: "shape", value: "BOX" }], // TODO: fix and re-test as it is broken
      },
    },

    sphereRadius: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "Radius",
        requires: [{ prop: "shape", value: "SPHERE" }], // TODO: fix and re-test as it is broken
      },
    },

    capsuleRadius: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "Radius",
        requires: [{ prop: "kind", value: "CAPSULE" }],
      },
    },
    capsuleHeight: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Height",
        requires: [{ prop: "kind", value: "CAPSULE" }],
      },
    },
  };

  static editor = {
    label: "Collider",
  };
}
