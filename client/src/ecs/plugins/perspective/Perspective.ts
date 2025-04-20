import { Box3, Object3D as ThreeObject3D, Vector2, Vector3 } from "three"

import type { Entity } from "~/ecs/base"
import type { Presentation } from "~/ecs/plugins/core"
import { PointerPositionRef } from "~/ecs/plugins/pointer-position"
import type { GetWorldFromScreenOpts, WorldPlanes } from "~/ecs/shared/WorldPlanes"

const BOUNDS_EXTENT = [-1, 1]

const _intersect = new Vector3()
const _v2 = new Vector2()

export class Perspective {
  count: number = 0
  avatar: Entity
  presentation: Presentation

  visibleBounds: Box3 = new Box3()
  center: ThreeObject3D = new ThreeObject3D()

  constructor(presentation) {
    this.presentation = presentation
  }

  update() {
    this.updateVisibleBounds()
  }

  setAvatar(avatar: Entity) {
    this.avatar = avatar
  }

  getAvatarPlanes(): WorldPlanes {
    return this.avatar?.get(PointerPositionRef)?.value
  }

  getWorldFromScreen(screenCoord: Vector2, target: Vector3, { plane = "XZ", camera }: GetWorldFromScreenOpts = {}) {
    const worldPlanes = this.getAvatarPlanes()
    if (worldPlanes) {
      const cam = camera ?? worldPlanes.camera
      return worldPlanes.getWorldFromScreen(screenCoord, target, {
        plane,
        camera: cam,
      })
    }
  }

  updateVisibleBounds() {
    const planes = this.getAvatarPlanes()
    if (!planes) return

    this.visibleBounds.makeEmpty()
    for (const x of BOUNDS_EXTENT) {
      for (const y of BOUNDS_EXTENT) {
        _v2.set(x, y)
        const point = planes.getWorldFromNormalizedScreen(_v2, _intersect)
        this.visibleBounds.expandByPoint(point)
      }
    }

    this.visibleBounds.getCenter(this.center.position)
  }
}
