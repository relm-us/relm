import { Component, StringType, NumberType, BooleanType } from "~/ecs/base";
import { Asset, AssetType, Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";
import { ShapeType } from "~/types/shapes";

/**
 * A classic 3D shape, e.g. box, sphere, cylinder, capsule.
 *
 * Note that the numeric suffix (`3`) is a version number, allowing
 * us to migrate to newer representations of a Shape component, with-
 * out disrupting previous Shape/Shape2 expectations.
 */
export class Shape3 extends Component {
  kind: ShapeType;

  size: Vector3;
  detail: number;

  color: string;
  emissive: string;
  roughness: number;
  metalness: number;

  asset: Asset;
  textureScale: number;
  fixedTexture: boolean;

  // local flag indicating re-build of shape is necessary after texture change
  needsRebuild: boolean;

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
        increment: 0.01,
        min: 0,
        max: 1,
      },
    },

    metalness: {
      type: NumberType,
      default: 0.0,
      editor: {
        label: "Metalness",
        increment: 0.01,
        min: 0,
        max: 1,
      },
    },

    asset: {
      type: AssetType,
      editor: {
        label: "Texture Asset",
      },
    },

    textureScale: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Texture Scale",
        increment: 0.01,
        requires: [{ prop: "asset" }],
      },
    },

    fixedTexture: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Fixed Texture",
        requires: [{ prop: "asset" }],
      },
    },
  };

  static editor = {
    label: "Shape",
  };
}
