import { Vector3, Box3, Object3D as ThreeObject3D } from "three";

import { Entity } from "~/ecs/base";
import { Object3D, Transform } from "~/ecs/plugins/core";
import { Shape } from "~/ecs/plugins/shape";
import { Translucent } from "~/ecs/plugins/translucent";
import { PlaneOrientation } from "~/ecs/plugins/core/Presentation";
import { NonInteractive } from "~/ecs/plugins/non-interactive";

import { DecoratedWorld } from "~/types/DecoratedWorld";

const INFINITY = 100;

const limit: Vector3 = new Vector3();

export class SelectionBox {
  world: DecoratedWorld;
  orientation: PlaneOrientation;
  entity: Entity;
  box: Box3 = new Box3();
  center: Vector3 = new Vector3();

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

  setRange(start: Vector3, end: Vector3, orientation: PlaneOrientation) {
    this.orientation = orientation;

    this.box.makeEmpty();
    this.box.expandByPoint(start);
    this.box.expandByPoint(end);

    this.box.getCenter(this.center);
    let axis = orientation === "xz" ? "y" : "z";
    [-1, 1].forEach((direction) => {
      limit.copy(this.center);
      limit[axis] += INFINITY * direction;
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

  getContainedEntities() {
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
  }

  hide() {
    this.entity.deactivate();
  }
}

function vectorIsZero(v: Vector3) {
  return v.x === 0 && v.y === 0 && v.z === 0;
}
