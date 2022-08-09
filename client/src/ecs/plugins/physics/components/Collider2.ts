import { Quaternion, Vector3 } from "three";

import { ShapeType } from "~/types/shapes";

import { Component, StringType, NumberType } from "~/ecs/base";
import { QuaternionType, Vector3Type } from "~/ecs/plugins/core";

import {
  AVATAR_BUILDER_INTERACTION,
  AVATAR_INTERACTION,
  GROUND_INTERACTION,
  NO_INTERACTION,
  OBJECT_INTERACTION,
} from "~/config/colliderInteractions";

// Taken from https://www.rapier.rs/javascript3d/enums/RigidBodyType.html
// By re-defining this here, we don't need to pass the `rapier` object around
enum RigidBodyType {
  Dynamic = 0,
  Fixed = 1,
  KinematicPositionBased = 2,
  KinematicVelocityBased = 3,
}

export type Behavior = {
  interaction: number;
  bodyType: number;
};

export class Collider2 extends Component {
  // Kinds of colliders:
  // - ETHEREAL: Immobile; never collides
  // - BARRIER: Immobile; will only collide with player in play mode
  // - GROUND: Immobile; will always collide with player (even in build mode)
  // - DYNAMIC: Can be moved via physics simulation; will only collide with player in play mode
  // - AVATAR-PLAY: Dynamic Avatar (Play Mode)
  // - AVATAR-BUILD: Dynamic Avatar (Build Mode)
  kind:
    | "ETHEREAL"
    | "BARRIER"
    | "GROUND"
    | "DYNAMIC"
    | "AVATAR-PLAY"
    | "AVATAR-BUILD"
    | "AVATAR-OTHER";

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

  // Collider rotation after offset
  rotation: Quaternion;

  // Collider density. Mass is calculated based on collider volume * density.
  density: number;

  friction: number;

  static props = {
    kind: {
      type: StringType,
      default: "ETHEREAL",
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "No Collision", value: "ETHEREAL" },
          { label: "Barrier", value: "BARRIER" },
          { label: "Ground", value: "GROUND" },
          { label: "Interactive", value: "DYNAMIC" },
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

    rotation: {
      type: QuaternionType,
      default: new Quaternion(),
      editor: {
        label: "Rotation",
      },
    },

    density: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Density",
      },
    },

    friction: {
      type: NumberType,
      default: 0.01,
      editor: {
        label: "Friction",
      },
    },
  };

  static editor = {
    label: "Collider",
  };

  get behavior(): Behavior {
    switch (this.kind) {
      case "ETHEREAL":
        return { interaction: NO_INTERACTION, bodyType: RigidBodyType.Fixed };
      case "BARRIER":
        return {
          interaction: OBJECT_INTERACTION,
          bodyType: RigidBodyType.Fixed,
        };
      case "GROUND":
        return {
          interaction: GROUND_INTERACTION,
          bodyType: RigidBodyType.Fixed,
        };
      case "DYNAMIC":
        return {
          interaction: OBJECT_INTERACTION,
          bodyType: RigidBodyType.Dynamic,
        };
      case "AVATAR-PLAY":
        return {
          interaction: AVATAR_INTERACTION,
          bodyType: RigidBodyType.Dynamic,
        };
      case "AVATAR-BUILD": {
        return {
          interaction: AVATAR_BUILDER_INTERACTION,
          bodyType: RigidBodyType.Dynamic,
        };
      }
      case "AVATAR-OTHER": {
        return {
          interaction: AVATAR_INTERACTION,
          bodyType: RigidBodyType.KinematicPositionBased,
        };
      }
      default:
        throw Error(`unknown collider kind ${this.kind}`);
    }
  }
}
