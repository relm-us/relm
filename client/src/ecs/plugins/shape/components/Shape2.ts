import { Component, StringType, NumberType } from "~/ecs/base";
import { Asset, AssetType, Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";
import { ShapeType } from "~/types/shapes";

export class Shape2 extends Component {
  kind: ShapeType;

  size: Vector3;
  detail: number;

  color: string;
  emissive: string;
  roughness: number;
  metalness: number;

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

    size: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: "Size",
        requires: [
          { prop: "kind", value: "BOX" /* default "x", "y", "z" */ },
          { prop: "kind", value: "SPHERE", labels: ["dia"] },
          { prop: "kind", value: "CYLINDER", labels: ["dia", "h"] },
          { prop: "kind", value: "CAPSULE", labels: ["dia", "h"] },
        ],
      },
    },

    detail: {
      type: NumberType,
      default: 0.25,
      editor: {
        label: "Mesh Detail",
      },
    },

    color: {
      type: StringType,
      default: "#f0f0f0",
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
      default: 0.25,
      editor: {
        label: "Roughness",
      },
    },

    metalness: {
      type: NumberType,
      default: 0.0,
      editor: {
        label: "Metalness",
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
