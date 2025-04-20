import { type Vector2, Vector3, Box3, type Object3D, Mesh, BoxGeometry, MeshStandardMaterial, Color } from "three"

import { Object3DRef } from "~/ecs/plugins/core"
import { NonInteractive } from "~/ecs/plugins/non-interactive"
import { WorldPlanes } from "~/ecs/shared/WorldPlanes"

import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld"

const DEFAULT_BOX_HEIGHT = 3

const limit: Vector3 = new Vector3()

export class SelectionBox {
  world: DecoratedECSWorld
  object: Mesh
  box: Box3 = new Box3()
  center: Vector3 = new Vector3()

  start: Vector3 = new Vector3()
  end: Vector3 = new Vector3()
  top: Vector3 = null

  endPlanes: WorldPlanes = null

  constructor(world: DecoratedECSWorld) {
    this.world = world
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshStandardMaterial({
      transparent: true,
      opacity: 0.4,
      color: new Color("#ffff00"),
    })
    this.object = new Mesh(geometry, material)
    this.object.visible = false
    this.world.presentation.scene.add(this.object)
  }

  reset() {
    this.top = null
    this.endPlanes = null
  }

  setStart(screenCoord: Vector2) {
    this.world.perspective.getWorldFromScreen(screenCoord, this.start, {
      plane: "XZ",
    })
    this.recalculateBox()
  }

  setEnd(screenCoord: Vector2) {
    this.world.perspective.getWorldFromScreen(screenCoord, this.end, {
      plane: "XZ",
    })
    this.recalculateBox()
  }

  setTop(screenCoord: Vector2) {
    if (!this.top) this.top = new Vector3()

    if (!this.endPlanes) {
      this.endPlanes = new WorldPlanes(this.world.presentation.camera, this.world.presentation.size, this.end)
    }
    this.endPlanes.getWorldFromScreen(screenCoord, this.top, {
      plane: "XY",
    })
    this.top.x = this.end.x
    this.top.y *= 2
    this.recalculateBox()
  }

  recalculateBox() {
    this.box.makeEmpty()
    this.box.expandByPoint(this.start)
    this.box.expandByPoint(this.end)

    // Get center BEFORE expanding by top point
    this.box.getCenter(this.center)

    if (this.top) {
      this.box.expandByPoint(this.top)
    }
    ;[-1, 1].forEach((direction) => {
      limit.copy(this.center)
      limit.y += DEFAULT_BOX_HEIGHT * direction
      this.box.expandByPoint(limit)
    })

    this.applyRange()
  }

  applyRange() {
    const size = new Vector3()
    this.box.getSize(size)
    const geometry = new BoxGeometry(size.x, size.y, size.z)
    this.object.position.copy(this.center)
    this.object.geometry = geometry
  }

  getContainedEntityIds() {
    const objectBounds = new Box3()
    const objectSize = new Vector3()
    const contained = []
    for (const entity of this.world.entities.entities.values()) {
      const object3d: Object3D = entity.get(Object3DRef)?.value
      if (!object3d) continue

      const nonInteractive = entity.get(NonInteractive)
      if (nonInteractive) continue

      objectBounds.setFromObject(object3d)
      objectBounds.getSize(objectSize)

      if (!vectorIsZero(objectSize) && this.box.containsBox(objectBounds)) {
        contained.push(object3d.userData.entityId)
      }
    }
    return contained
  }

  show() {
    this.object.visible = true
    this.reset()
  }

  hide() {
    this.object.visible = false
  }
}

function vectorIsZero(v: Vector3) {
  return v.x === 0 && v.y === 0 && v.z === 0
}
