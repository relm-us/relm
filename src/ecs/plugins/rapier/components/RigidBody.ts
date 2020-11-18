import { Component, StringType, NumberType } from "hecs";
import { Vector3Type } from "hecs-plugin-core";

export class RigidBody extends Component {
  static props = {
    kind: {
      type: StringType,
      default: "STATIC",
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "Static", value: "STATIC" },
          { label: "Kinematc", value: "KINEMATIC" },
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
        label: "Mass",
        requires: [{ prop: "kind", value: "DYNAMIC" }],
      },
    },

    damping: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Linear Damping",
      },
    },
  };

  static editor = {
    label: "RigidBody",
  };
}
