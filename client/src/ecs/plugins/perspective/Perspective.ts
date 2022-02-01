import { Box3, Object3D as ThreeObject3D, Vector2, Vector3 } from "three";

import { Entity } from "~/ecs/base";
import { Presentation } from "~/ecs/plugins/core";
import { PointerPositionRef } from "~/ecs/plugins/pointer-position";
import { GetWorldFromScreenOpts, WorldPlanes } from "~/ecs/shared/WorldPlanes";

const BOUNDS_EXTENT = [-1, 1];

const _intersect = new Vector3();
const _v2 = new Vector2();

export class Perspective {
  avatar: Entity;
  presentation: Presentation;

  visibleBounds: Box3 = new Box3();
  center: ThreeObject3D = new ThreeObject3D();

  constructor(presentation) {
    this.presentation = presentation;
  }

  update() {
    this.updateVisibleBounds();
  }

  setAvatar(avatar: Entity) {
    this.avatar = avatar;
  }

  getAvatarPlanes(): WorldPlanes {
    return this.avatar?.get(PointerPositionRef)?.value;
  }

  getWorldFromScreen(
    screenCoord: Vector2,
    target: Vector3,
    { plane = "xz", camera }: GetWorldFromScreenOpts = {}
  ) {
    const worldPlanes = this.getAvatarPlanes();
    if (worldPlanes) {
      const cam = camera ?? worldPlanes.camera;
      return worldPlanes.getWorldFromScreen(screenCoord, target, {
        plane,
        camera: cam,
      });
    }
  }

  updateVisibleBounds() {
    const planes = this.getAvatarPlanes();
    if (!planes) return;

    this.visibleBounds.makeEmpty();
    for (let x of BOUNDS_EXTENT) {
      for (let y of BOUNDS_EXTENT) {
        _v2.set(x, y);
        const point = planes.getWorldFromNormalizedScreen(_v2, _intersect);
        this.visibleBounds.expandByPoint(point);
      }
    }

    this.visibleBounds.getCenter(this.center.position);
  }
}
