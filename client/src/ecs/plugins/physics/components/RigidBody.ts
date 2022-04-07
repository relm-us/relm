import { Vector3 } from "three";
import { Component, StringType, NumberType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";

export class RigidBody extends Component {
  kind: "STATIC" | "KINEMATIC" | "DYNAMIC";

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
  };

  static editor = {
    label: "Rigid Body",
  };
}
