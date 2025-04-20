import type { Collider, ConvexPolyhedron } from "@dimforge/rapier3d"
import { Vector3, type PerspectiveCamera, Matrix4 } from "three"
import { BASE_LAYER_ID } from "~/config/constants"

import { System, Not, Groups, type Entity } from "~/ecs/base"
import type { Queries } from "~/ecs/base/Query"
import { Object3DRef, Transform } from "~/ecs/plugins/core"
import type { Physics } from "~/ecs/plugins/physics"

import { Camera, CameraAttached, AlwaysOnStage, KeepOnStage } from "../components"

import { getFrustumShape } from "../utils/frustum"

const vUp = new Vector3(0, 1, 0)
const v1 = new Vector3()
const m4 = new Matrix4()

export const intersectCalcTime: number[] = Array(10).fill(0)

let intersectCalcTimeIdx = 0

export class CameraSystem extends System {
  physics: Physics
  camera: PerspectiveCamera
  frustumShape: ConvexPolyhedron
  frustumAspect: number

  visibleLayers: Map<string, boolean>
  alwaysOnStageLayers: Map<string, boolean>

  deactivateOffCameraEntities: boolean
  recentlyOnStage: Set<Entity>
  nowOnSet: Set<Entity>

  order = Groups.Presentation + 400

  static stageNeedsUpdate: boolean = false

  static queries: Queries = {
    added: [Object3DRef, Camera, Not(CameraAttached)],
    active: [Camera, CameraAttached],
    removed: [Not(Camera), CameraAttached],
    // For entities tagged with "KeepOnStage", promote to StateComponent
    promote: [KeepOnStage, Not(AlwaysOnStage)],
  }

  init({ physics, presentation }) {
    this.physics = physics
    this.camera = presentation.camera

    this.buildFrustum()

    this.visibleLayers = new Map()
    this.alwaysOnStageLayers = new Map()

    this.recentlyOnStage = new Set()
    this.deactivateOffCameraEntities = false
  }

  update() {
    // TODO: combine this with resize observer?
    if (this.camera.aspect !== this.frustumAspect) {
      this.buildFrustum()
    }

    this.queries.added.forEach((entity) => this.build(entity))
    this.queries.active.forEach((entity) => this.move(entity))
    this.queries.removed.forEach((entity) => this.remove(entity))
    this.queries.promote.forEach((entity) => entity.add(AlwaysOnStage))

    if (this.world.version % 13 === 0 || CameraSystem.stageNeedsUpdate) {
      CameraSystem.stageNeedsUpdate = false
      this.activateDeactivateEntitiesOnStage()
    }
  }

  activateDeactivateEntitiesOnStage() {
    const intersectCalcTimeBefore = performance.now()

    // There should be just 1 active camera, but we access it via forEach
    this.queries.active.forEach((entity) => {
      const transform: Transform = entity.get(Transform)

      // NOTE: This call takes about 0.6 ms on my system, in a world of 30 entities.
      this.physics.world.intersectionsWithShape(
        transform.position,
        transform.rotation,
        this.frustumShape,
        (collider: Collider) => {
          const entity = this.physics.colliders.get(collider.handle)

          if (!this.isAlwaysOnStage(entity)) {
            entity.local.lastSeenOnStage = this.world.version
            this.recentlyOnStage.add(entity)
          }

          // Activate anything within the Frustum that is inactive, but should be visible
          if (!entity.active && this.isEntityOnVisibleLayer(entity)) {
            entity.activate()
          }

          return true
        },
      )
    })

    if (!this.deactivateOffCameraEntities) return

    for (const entity of this.recentlyOnStage) {
      if (entity.active && !this.isEntityOnVisibleLayer(entity)) {
        this.recentlyOnStage.delete(entity)
        entity.deactivate()
      }

      // if (this.isAlwaysOnStage(entity)) continue;

      const lastSeen = entity.local.lastSeenOnStage
      if (this.world.version - lastSeen > 30) {
        if (this.isAlwaysOnStage(entity)) {
          continue
        } else {
          this.recentlyOnStage.delete(entity)
          entity.deactivate()
        }
      }
    }

    const intersectCalcTimeAfter = performance.now()

    intersectCalcTime[intersectCalcTimeIdx++ % intersectCalcTime.length] =
      intersectCalcTimeAfter - intersectCalcTimeBefore
  }

  build(entity: Entity) {
    const object3d = entity.get(Object3DRef).value

    object3d.add(this.camera)

    entity.add(CameraAttached)
  }

  move(entity: Entity) {
    const camera: Camera = entity.get(Camera)
    const transform: Transform = entity.get(Transform)

    v1.setFromSpherical(camera.sphere)

    transform.position.copy(camera.center).add(v1)

    m4.lookAt(transform.position, camera.lookAt, vUp)
    transform.rotation.setFromRotationMatrix(m4)

    transform.modified()
  }

  remove(entity: Entity) {
    this.camera.parent.remove(this.camera)
    entity.remove(CameraAttached)
  }

  buildFrustum() {
    this.frustumAspect = this.camera.aspect
    this.frustumShape = getFrustumShape(this.camera, this.physics.rapier)
  }

  beginDeactivatingOffStageEntities() {
    this.deactivateOffCameraEntities = true

    // Keep a timestamp of every entity on stage
    for (const entity of this.world.entities.entities.values()) {
      entity.local.lastSeenOnStage = this.world.version
      this.recentlyOnStage.add(entity)
    }
  }

  endDeactivatingOffStageEntities() {
    this.deactivateOffCameraEntities = false
  }

  isAlwaysOnStage(entity) {
    return entity.has(AlwaysOnStage) || this.isEntityOnAlwaysOnStageLayer(entity)
  }

  isEntityOnVisibleLayer(entity) {
    if (entity.has(AlwaysOnStage)) return true

    const layerId = entity.meta.layerId
    if (!layerId) return this.visibleLayers.get(BASE_LAYER_ID)

    const layer = this.visibleLayers.get(layerId)
    if (layer == null /* `==` tests null or undefined */) return true

    return layer
  }

  isEntityOnAlwaysOnStageLayer(entity) {
    const layerId = entity.meta.layerId
    if (!layerId) return false

    const layer = this.alwaysOnStageLayers.get(layerId)
    if (layer == null /* `==` tests null or undefined */) return false

    return layer
  }
}
