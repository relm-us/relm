import { Vector3, Quaternion } from "three";
import { Component, StringType } from "~/ecs/base";
import { Vector3Type, QuaternionType } from "../types";

export class Transform extends Component {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;

  // Can be used to override the threejs object.userData.entityId
  entityId: string;

  readonly positionWorld: Vector3 = new Vector3();
  readonly rotationWorld: Quaternion = new Quaternion();
  readonly scaleWorld: Vector3 = new Vector3(1, 1, 1);

  // used for recursion
  frame: number;

  static props = {
    position: {
      type: Vector3Type,
      editor: {
        label: "Position",
      },
    },

    rotation: {
      type: QuaternionType,
      editor: {
        label: "Rotation",
      },
    },

    scale: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: "Scale",
      },
    },

    entityId: {
      type: StringType,
    },
  };

  static editor = {
    label: "Transform",
  };
}
