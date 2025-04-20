import { Euler, type PerspectiveCamera, Vector3, MathUtils } from "three"

import { get } from "svelte/store"

import type { Entity } from "~/ecs/base"
import { Object3DRef, Transform } from "~/ecs/plugins/core"
import { Camera, CameraGravity, CameraGravitySystem, CameraSystem } from "~/ecs/plugins/camera"
import { Oculus } from "~/ecs/plugins/html2d"
import { easeTowards } from "~/ecs/shared/easeTowards"

import { viewportScale, worldUIMode } from "~/stores"
import { centerCameraVisible } from "~/stores/centerCameraVisible"

import { makeCamera } from "~/prefab/makeCamera"
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld"
import {
  AVATAR_HEIGHT,
  CAMERA_PLAY_DAMPENING,
  CAMERA_PLAY_ZOOM_MAX,
  CAMERA_PLAY_ZOOM_MIN,
  DEFAULT_CAMERA_ANGLE,
  DEFAULT_VIEWPORT_ZOOM,
  OCULUS_HEIGHT_STAND,
} from "~/config/constants"

const directionNeg = new Euler()
const v1 = new Vector3()

// Awesome two-finger control on touchpad
// https://github.com/Suncapped/babs/blob/prod/src/sys/CameraSys.ts

export class CameraManager {
  // The HECS world
  ecsWorld: DecoratedECSWorld

  // The ECS entity with a Camera component holding the ThreeJS PerspectiveCamera object
  entity: Entity

  // The participant's avatar
  avatar: Entity

  // How much the camera is "off-center" from the participant
  pan: Vector3 = new Vector3()

  // 0: zoomed all the way in; 1: zoomed all the way out
  zoom: number
  zoomedInDistance: number = CAMERA_PLAY_ZOOM_MIN
  zoomedOutDistance: number = CAMERA_PLAY_ZOOM_MAX

  // How much "dampening" to add to camera panning
  dampening: number = CAMERA_PLAY_DAMPENING

  // The angle of rotation around the avatar
  direction: Euler = new Euler()
  targetDir: Euler = new Euler()

  // The position of the camera, relative to its target (i.e. the avatar)
  followOffset: Vector3

  // Track things that need cleaning up before deinit
  unsubs: Function[] = []

  get threeCamera(): PerspectiveCamera {
    const camera: Object3DRef = this.entity.get(Object3DRef)
    return camera.value.children[0] as PerspectiveCamera
  }

  get zoomRange(): number {
    return (this.zoomedOutDistance - this.zoomedInDistance) * this.zoom
  }

  get zoomDistance(): number {
    return this.zoomRange + this.zoomedInDistance
  }

  get cameraSystem(): CameraSystem {
    return this.ecsWorld.systems.get(CameraSystem) as CameraSystem
  }

  constructor(ecsWorld: DecoratedECSWorld, avatar: Entity) {
    this.ecsWorld = ecsWorld
    this.avatar = avatar
  }

  init() {
    this.setPan(0, 0)

    this.zoom = DEFAULT_VIEWPORT_ZOOM

    this.direction.x = DEFAULT_CAMERA_ANGLE

    this.followOffset = new Vector3()
    this.calcFollowOffset()

    // Create the ECS camera entity that holds the ThreeJS camera
    this.entity = makeCamera(this.ecsWorld).activate()
    this.entity.get(Transform).rotation.setFromEuler(directionNeg)

    // Listen to the mousewheel for zoom events
    this.unsubs.push(
      viewportScale.subscribe(($zoom) => {
        this.zoom = $zoom
      }),
    )
  }

  worldInit() {
    this.cameraSystem.beginDeactivatingOffStageEntities()
  }

  deinit() {
    this.unsubs.forEach((f) => f())
    this.unsubs.length = 0

    this.entity.destroy()
  }

  moveTo(position: Vector3) {
    const transform = this.entity.get(Transform)
    transform.position.copy(position).add(this.followOffset)

    const camera: Camera = this.entity.get(Camera)
    camera.center.copy(position)
    camera.lookAt.copy(position)
  }

  isOffCenter(distance: number = 4) {
    return this.pan.length() > distance
  }

  setCameraSystemLayerVisibility(layerId: string, visible: boolean) {
    this.cameraSystem.visibleLayers.set(layerId, visible)
    CameraSystem.stageNeedsUpdate = true
  }

  keepLayerOnStage(layerId: string) {
    this.cameraSystem.alwaysOnStageLayers.set(layerId, true)
    CameraSystem.stageNeedsUpdate = true
  }

  clearLayersKeptOnStage() {
    this.cameraSystem.alwaysOnStageLayers.clear()
    CameraSystem.stageNeedsUpdate = true
  }

  update(delta: number) {
    const avatar: Transform = this.avatar.get(Transform)
    if (!this.entity || !avatar) return

    const camera: Camera = this.entity.get(Camera)

    // Auto-control panning when in play mode
    if (get(worldUIMode) === "play") {
      this.pan.copy(CameraGravitySystem.centroid).sub(avatar.position)
    }

    const gravity: CameraGravity = this.avatar.get(CameraGravity)
    const oculus: Oculus = this.avatar.get(Oculus)
    gravity.sphere.radius = oculus.showVideo ? oculus.targetOffset.y : OCULUS_HEIGHT_STAND / 2

    const incr = Math.PI * delta
    this.smoothRotateTowardsTarget(incr)

    v1.copy(avatar.position).add(this.pan)
    easeTowards(camera.center, v1, this.dampening)
    easeTowards(camera.lookAt, v1, this.dampening)
    camera.sphere.radius = this.zoomDistance
    camera.sphere.phi = this.direction.x
    camera.sphere.theta = this.direction.y
  }

  smoothRotateTowardsTarget(incr: number) {
    const arc = this.targetDir.y - this.direction.y
    if (arc !== 0) {
      if (Math.abs(arc) < incr) {
        this.direction.y = this.targetDir.y
      } else {
        this.direction.y += Math.sign(arc) * incr
      }
    }
  }

  setPan(x: number, z: number) {
    this.pan.x = x
    this.pan.y = AVATAR_HEIGHT
    this.pan.z = z
  }

  setFov(fov: number) {
    this.ecsWorld.presentation.camera.fov = fov
    this.ecsWorld.presentation.camera.updateProjectionMatrix()
    this.ecsWorld.cssPresentation.camera.fov = fov
    this.ecsWorld.cssPresentation.camera.updateProjectionMatrix()
  }

  center() {
    this.setPan(0, 0)
    centerCameraVisible.set(false)
  }

  setZoomRange(min: number, max: number) {
    if (min < 0) min = 0
    if (max < min) max = min

    // best-effort preserve camera distance after change in range
    this.zoom = MathUtils.clamp(this.zoomRange / (max - min), 0, 1)
    viewportScale.set(this.zoom)

    this.zoomedInDistance = min
    this.zoomedOutDistance = max
  }

  getFov() {
    return this.ecsWorld.presentation.camera.fov
  }

  calcFollowOffset() {
    directionNeg.set(-this.direction.x, this.direction.y, this.direction.z, "YXZ")

    this.followOffset.set(0, 0, 1).applyEuler(directionNeg).multiplyScalar(this.zoomDistance).add(this.pan)
  }

  rotate({ x, y }) {
    if (x !== undefined) {
      this.targetDir.x = x
      this.direction.x = x
    }
    if (y !== undefined) {
      this.targetDir.y = y
      this.direction.y = y
    }
  }

  rotate0() {
    this.targetDir.y = 0
  }

  rotateLeft90() {
    this.targetDir.y = this.direction.y === 0 ? Math.PI / 2 : 0
  }

  rotateRight90() {
    this.targetDir.y = this.direction.y === 0 ? -Math.PI / 2 : 0
  }

  viewFromAbove(height: number = 30) {
    // TODO: set spherical coords to height, 0, 0
  }
}

function easeNumberTowards(start, dest, incr) {
  if (start < dest - incr) {
    return start + incr
  } else if (start > dest + incr) {
    return start - incr
  } else {
    return dest
  }
}
