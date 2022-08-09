import { Vector3 } from "three";

import { Entity, LocalComponent, RefType } from "~/ecs/base";

export class TransformControls extends LocalComponent {
  onChange: (entity: Entity) => void;
  onMove: (entity: Entity, delta: Vector3) => void;
  onRotate: (
    entity: Entity,
    position: Vector3,
    theta: number,
    axis: Vector3
  ) => void;
  onBegin: (entity: Entity) => void;
  onComplete: (entity: Entity) => void;

  static props = {
    onChange: {
      type: RefType,
    },

    onMove: {
      type: RefType,
    },

    onRotate: {
      type: RefType,
    },

    onBegin: {
      type: RefType,
    },

    onComplete: {
      type: RefType,
    },
  };
}
