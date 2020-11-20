import { Component, StringType, NumberType } from "hecs";
import { Vector3Type, Vector3 } from "hecs-plugin-core";

export class BetterShape extends Component {
  static props = {
    kind: {
      type: StringType,
      default: "BOX",
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "Box", value: "BOX" },
          { label: "Sphere", value: "SPHERE" },
          { label: "Capsule", value: "CAPSULE" },
        ],
      },
    },
    boxSize: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: "Size",
        requires: [{ prop: "kind", value: "BOX" }],
      },
    },
    sphereRadius: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "Radius",
        requires: [{ prop: "kind", value: "SPHERE" }],
      },
    },
    sphereWidthSegments: {
      type: NumberType,
      default: 16,
      editor: {
        label: "Width Segments",
        requires: [{ prop: "kind", value: "SPHERE" }],
      },
    },
    sphereHeightSegments: {
      type: NumberType,
      default: 12,
      editor: {
        label: "Height Segments",
        requires: [{ prop: "kind", value: "SPHERE" }],
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
    capsuleSegments: {
      type: NumberType,
      default: 5,
      editor: {
        label: "Segments",
        requires: [{ prop: "kind", value: "CAPSULE" }],
      },
    },
    color: {
      type: StringType,
      default: "#333333",
      editor: {
        label: "Color",
        input: "Color",
      },
    },
    emissive: {
      type: StringType,
      default: "#000000",
      editor: {
        label: "Emissive Color",
        input: "Color",
      },
    },
    roughness: {
      type: NumberType,
      default: 0.8,
      editor: {
        label: "Roughness",
      },
    },
    metalness: {
      type: NumberType,
      default: 0.9,
      editor: {
        label: "Metalness",
      },
    },
  };
  static editor = {
    label: "Shape",
  };
}
