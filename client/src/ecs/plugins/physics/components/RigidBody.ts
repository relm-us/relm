import { Vector3 } from "three";
import { Component, StringType, NumberType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";

export class RigidBody extends Component {
  kind: "STATIC" | "KINEMATIC" | "DYNAMIC";
  linearVelocity: Vector3;
  angularVelocity: Vector3;
  mass: number;
  angularDamping: number;
  linearDamping: number;

  // The `sync` property is transient; it allows us to tell the physics
  // system that the rigid body's translation (position) should be copied
  // from the WorldTransform. Useful when "warping" the Avatar to a new
  // position.
  sync: boolean | number;

  static props = {
    kind: {
      type: StringType,
      default: "STATIC",
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "Static", value: "STATIC" },
          { label: "Kinematic", value: "KINEMATIC" },
          { label: "Dynamic", value: "DYNAMIC" },
        ],
      },
    },

    linearVelocity: {
      type: Vector3Type,
      editor: {
        label: "Linear Velocity",
        requires: [{ prop: "kind", value: "DYNAMIC" }],
      },
    },

    angularVelocity: {
      type: Vector3Type,
      editor: {
        label: "Angular Velocity",
        requires: [{ prop: "kind", value: "DYNAMIC" }],
      },
    },

    mass: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Additional Mass",
        requires: [{ prop: "kind", value: "DYNAMIC" }],
      },
    },

    angularDamping: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Angular Damping",
      },
    },

    linearDamping: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Linear Damping",
      },
    },
  };

  static editor = {
    label: "Rigid Body",
  };
}
