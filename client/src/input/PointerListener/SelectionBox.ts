import { Vector2, Vector3, Box3, Object3D as ThreeObject3D } from "three";

import { Entity } from "~/ecs/base";
import { Object3D, Transform } from "~/ecs/plugins/core";
import { Shape } from "~/ecs/plugins/shape";
import { Translucent } from "~/ecs/plugins/translucent";
import { NonInteractive } from "~/ecs/plugins/non-interactive";
import { WorldPlanes } from "~/ecs/shared/WorldPlanes";

import { DecoratedWorld } from "~/types/DecoratedWorld";

const DEFAULT_BOX_HEIGHT = 3;

const limit: Vector3 = new Vector3();

export class SelectionBox {
  world: DecoratedWorld;
  entity: Entity;
  box: Box3 = new Box3();
  center: Vector3 = new Vector3();

  start: Vector3 = new Vector3();
  end: Vector3 = new Vector3();
  top: Vector3 = null;

  endPlanes: WorldPlanes = null;

  constructor(world: DecoratedWorld) {
    this.world = world;
    this.entity = this.world.entities
      .create("SelectionBox")
      .add(Transform, { position: new Vector3() })
      .add(Shape, {
        kind: "BOX",
        color: "#ffff00",
      })
      .add(Translucent);
  }

  reset() {
    this.top = null;
    this.endPlanes = null;
  }

  setStart(screenCoord: Vector2) {
    this.world.perspective.getWorldFromScreen(screenCoord, this.start, {
      plane: "xz",
    });
    this.recalculateBox();
  }

  setEnd(screenCoord: Vector2) {
    this.world.perspective.getWorldFromScreen(screenCoord, this.end, {
      plane: "xz",
    });
    this.recalculateBox();
  }

  setTop(screenCoord: Vector2) {
    if (!this.top) this.top = new Vector3();

    if (!this.endPlanes) {
      this.endPlanes = new WorldPlanes(
        this.world.presentation.camera,
        this.world.presentation.size,
        this.end
      );
    }
    this.endPlanes.getWorldFromScreen(screenCoord, this.top, {
      plane: "xy",
    });
    this.top.x = this.end.x;
    this.top.y *= 2;
    this.recalculateBox();
  }

  recalculateBox() {
    this.box.makeEmpty();
    this.box.expandByPoint(this.start);
    this.box.expandByPoint(this.end);

    // Get center BEFORE expanding by top point
    this.box.getCenter(this.center);

    if (this.top) {
      this.box.expandByPoint(this.top);
    }

    [-1, 1].forEach((direction) => {
      limit.copy(this.center);
      limit.y += DEFAULT_BOX_HEIGHT * direction;
      this.box.expandByPoint(limit);
    });

    this.applyRange();
  }

  applyRange() {
    const transform: Transform = this.entity.get(Transform);
    const shape: Shape = this.entity.get(Shape);
    const translucent: Translucent = this.entity.get(Translucent);
    transform.position.copy(this.center);
    this.box.getSize(shape.boxSize);
    shape.modified();
    translucent.modified();
  }

  getContainedEntityIds() {
    const objectBounds = new Box3();
    const objectSize = new Vector3();
    const contained = [];
    for (const entity of this.world.entities.entities.values()) {
      if (entity.id === this.entity.id) continue;

      const object3d: ThreeObject3D = entity.get(Object3D)?.value;
      if (!object3d) continue;

      const nonInteractive = entity.get(NonInteractive);
      if (nonInteractive) continue;

      objectBounds.setFromObject(object3d);
      objectBounds.getSize(objectSize);

      if (!vectorIsZero(objectSize) && this.box.containsBox(objectBounds)) {
        contained.push(object3d.userData.entityId);
      }
    }
    return contained;
  }

  show() {
    this.entity.activate();
    this.reset();
  }

  hide() {
    this.entity.deactivate();
  }
}

function vectorIsZero(v: Vector3) {
  return v.x === 0 && v.y === 0 && v.z === 0;
}
