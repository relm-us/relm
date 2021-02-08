import { Component, StringType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class BallJoint extends Component {
  static props = {
    entity: {
      type: StringType,
      editor: {
        label: "Entity",
        input: "Entity",
      },
    },
    position: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
      editor: {
        label: "Joint Position",
      },
    },
  };
  static editor = {
    label: "Fixed Joint",
  };
}
