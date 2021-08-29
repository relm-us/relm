import { Vector3 } from "three";

import { Entity } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import {
  PointerPosition,
  PointerPositionRef,
} from "~/ecs/plugins/pointer-position";
import type { PlaneOrientation } from "~/ecs/shared/WorldPlanes";

import { DecoratedWorld } from "~/types/DecoratedWorld";
import { uuidv4 } from "~/utils/uuid";

export class DragPlane {
  world: DecoratedWorld;
  orientation: PlaneOrientation = "xz";
  center: Vector3 = new Vector3();
  entity: Entity;

  constructor(world: DecoratedWorld) {
    this.world = world;
    this.entity = this.world.entities
      .create("PointerDragPlane", uuidv4())
      .add(Transform, { position: new Vector3() })
      .add(PointerPosition);
  }

  setOrientation(orientation: PlaneOrientation) {
    this.orientation = orientation;
  }

  setCenter(center: Vector3) {
    this.center.copy(center);
  }

  show() {
    this.entity.activate();

    const transform = this.entity.get(Transform);
    transform.position.copy(this.center);
  }

  hide() {
    this.entity.deactivate();
  }
}
