import { Component, StringType, NumberType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";
import { ShapeType } from "~/types/shapes";

export class Collider2 extends Component {
  // Kinds of colliders:
  // - ETHEREAL: Immobile; never collides
  // - SOLID: Immobile; will only collide with player in play mode
  // - GROUND: Immobile; will always collide with player (even in build mode)
  // - DYNAMIC: Can be moved via physics simulation; will only collide with player in play mode
  kind: "ETHEREAL" | "SOLID" | "GROUND" | "DYNAMIC";

  // Collider shapes
  shape: ShapeType;

  // Collider size
  // - BOX: uses all x, y, z
  // - SPHERE: uses x as diameter
  // - CYLINDER: uses x as diameter, y as height
  // - CAPSULE: uses x as diameter, y as height
  size: Vector3;

  // Collider offset from center
  offset: Vector3;

  // Collider density. Mass is calculated based on collider volume * density.
  density: number;

  static props = {
    kind: {
      type: StringType,
      default: "ETHEREAL",
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "Ethereal", value: "ETHEREAL" },
          { label: "Static", value: "SOLID" },
          { label: "Ground", value: "GROUND" },
          { label: "Dynamic", value: "DYNAMIC" },
        ],
      },
    },

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

    size: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: "Size",
        requires: [
          { prop: "shape", value: "BOX" /* default "x", "y", "z" */ },
          { prop: "shape", value: "SPHERE", labels: ["dia"] },
          { prop: "shape", value: "CYLINDER", labels: ["dia", "h"] },
          { prop: "shape", value: "CAPSULE", labels: ["dia", "h"] },
        ],
      },
    },

    offset: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
      editor: {
        label: "Offset",
      },
    },

    density: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Density",
      },
    },
  };

  static editor = {
    label: "Collider",
  };
}
