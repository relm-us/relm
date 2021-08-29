import { Component, StringType, NumberType } from "~/ecs/base";
import { Asset, AssetType, Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Shape extends Component {
  kind: string;

  boxSize: Vector3;

  sphereRadius: number;
  sphereWidthSegments: number;
  sphereHeightSegments: number;

  cylinderRadius: number;
  cylinderHeight: number;
  cylinderSegments: number;

  capsuleRadius: number;
  capsuleHeight: number;
  capsuleSegments: number;

  color: string;
  emissive: string;
  roughness: number;
  metalness: number;

  texture: Asset;
  textureScale: number;

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
        requires: [{ prop: "kind", value: "BOX" }],
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

    /**
     * Cylinder Properties
     */

    cylinderRadius: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "Radius",
        requires: [{ prop: "kind", value: "CYLINDER" }],
      },
    },

    cylinderHeight: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Height",
        requires: [{ prop: "kind", value: "CYLINDER" }],
      },
    },

    cylinderSegments: {
      type: NumberType,
      default: 6,
      editor: {
        label: "Segments",
        requires: [{ prop: "kind", value: "CYLINDER" }],
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

    /**
     * General Properties
     */
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

    texture: {
      type: AssetType,
      default: null,
      editor: {
        label: "Texture",
      },
    },
    textureScale: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Texture Scale",
      },
    },
  };

  static editor = {
    label: "Shape",
  };
}
