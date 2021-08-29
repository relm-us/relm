import { Vector3 } from "three";

import { Entity, World } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import {
  PointerPosition,
  PointerPositionRef,
} from "~/ecs/plugins/pointer-position";
import type { PlaneOrientation } from "~/ecs/shared/WorldPlanes";

import { uuidv4 } from "~/utils/uuid";

export class DragPlane {
  world: World;
  plane: PlaneOrientation = "xz";
  center: Vector3 = new Vector3();
  entity: Entity;

  constructor(world: World) {
    this.world = world;
  }

  setOrientation(orientation: PlaneOrientation) {
    this.plane = orientation;
  }

  setCenter(center: Vector3) {
    this.center.copy(center);
  }

  show() {
    this.entity = this.world.entities
      .create("PointerDragPlane", uuidv4())
      .add(Transform, { position: this.center })
      .add(PointerPosition)
      .activate();
  }
}
