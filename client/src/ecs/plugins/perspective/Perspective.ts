import { Box3, Vector2, Vector3 } from "three";

import { Entity } from "~/ecs/base";
import { Presentation } from "~/ecs/plugins/core";
import { PointerPositionRef } from "~/ecs/plugins/pointer-position";

const BOUNDS_EXTENT = [-1, 1];

const _intersect = new Vector3();
const _v2 = new Vector2();

export class Perspective {
  avatar: Entity;
  presentation: Presentation;

  visibleBounds: Box3 = new Box3();

  constructor(presentation) {
    this.presentation = presentation;
  }

  update() {
    this.updateVisibleBounds();
  }

  setAvatar(avatar: Entity) {
    this.avatar = avatar;
  }

  getAvatarPlanes() {
    return this.avatar?.get(PointerPositionRef)?.value;
  }

  getWorldFromScreen(...args) {
    return this.getAvatarPlanes()?.getWorldFromScreen(...args);
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
  }
}
