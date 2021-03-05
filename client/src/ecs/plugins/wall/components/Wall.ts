import { Component, StringType, NumberType, BooleanType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Wall extends Component {
  static props = {
    size: {
      type: Vector3Type,
      default: new Vector3(2, 2, 0.25),
      editor: {
        label: "Size",
      },
    },
    visible: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Visible"
      }
    },
    convexity: {
      type: NumberType,
      default: 0.0,
      editor: {
        label: "Convexity",
      },
    },
    segments: {
      type: NumberType,
      default: 3,
      editor: {
        label: "Segments",
      },
    },
    color: {
      type: StringType,
      default: "#bbbbbb",
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
      default: 0.5,
      editor: {
        label: "Roughness",
      },
    },
    metalness: {
      type: NumberType,
      default: 0.2,
      editor: {
        label: "Metalness",
      },
    },
  };
  static editor = {
    label: "Wall",
  };
}
