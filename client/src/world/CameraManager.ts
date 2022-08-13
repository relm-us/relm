import { Euler, PerspectiveCamera, Quaternion, Vector3 } from "three";

import { Entity } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { Follow } from "~/ecs/plugins/follow";

import { viewportScale } from "~/stores";
import { centerCameraVisible } from "~/stores/centerCameraVisible";

import { makeCamera } from "~/prefab/makeCamera";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import {
  AVATAR_HEIGHT,
  CAMERA_LERP_ALPHA,
  DEFAULT_CAMERA_ANGLE,
  DEFAULT_VIEWPORT_ZOOM,
} from "~/config/constants";

type CameraFollow = {
  type: "follow";
};

type CameraAbove = {
  type: "above";
  height: number;
};

type CameraState = CameraFollow | CameraAbove;

const directionNeg = new Euler();

export class CameraManager {
  // Track what we're doing with the camera right now
  state: CameraState;

  // The HECS world
  ecsWorld: DecoratedECSWorld;

  // The ECS entity with a Camera component holding the ThreeJS PerspectiveCamera object
  entity: Entity;

  // The participant's avatar
  avatar: Entity;

  // How much the camera is "off-center" from the participant
  pan: Vector3 = new Vector3();

  // 0: zoomed all the way in; 1: zoomed all the way out
  zoom: number;
  zoomedInDistance: number = 5;
  zoomedOutDistance: number = 25;

  // The angle of rotation around the avatar
  direction: Euler = new Euler();

  // The position of the camera, relative to its target (i.e. the avatar)
  followOffset: Vector3;

  // Track things that need cleaning up before deinit
  unsubs: Function[] = [];

  get threeCamera(): PerspectiveCamera {
    const camera: Object3DRef = this.entity.get(Object3DRef);
    return camera.value.children[0] as PerspectiveCamera;
  }

  constructor(ecsWorld: DecoratedECSWorld, avatar: Entity) {
    this.ecsWorld = ecsWorld;
    this.avatar = avatar;
  }

  init() {
    this.setModeFollow();
    this.setPan(0, 0);

    this.zoom = DEFAULT_VIEWPORT_ZOOM / 100;

    this.direction.x = DEFAULT_CAMERA_ANGLE;

    this.followOffset = new Vector3();
    this.calcFollowOffset();

    // Create the ECS camera entity that holds the ThreeJS camera
    this.entity = makeCamera(this.ecsWorld).activate();
    this.entity.get(Transform).rotation.setFromEuler(directionNeg);

    // Listen to the mousewheel for zoom events
    this.unsubs.push(
      viewportScale.subscribe(($scale) => {
        if (this.state.type === "follow") {
          this.zoom = $scale / 100;
        }
      })
    );
  }

  deinit() {
    this.unsubs.forEach((f) => f());
    this.unsubs.length = 0;

    this.entity.destroy();
  }

  moveTo(position: Vector3) {
    const transform = this.entity.get(Transform);
    transform.position.copy(position).add(this.followOffset);
  }

  isOffCenter(distance: number = 4) {
    return this.pan.length() > distance;
  }

  update(delta: number) {
    const camera = this.entity;
    if (!camera || !this.avatar.has(Transform)) return;

    switch (this.state.type) {
      case "follow": {
        this.calcFollowOffset();

        // TODO: Make a smoother transition here; don't hide the fact that
        // we depend on calcFollowOffset to calculate directionNeg first
        this.entity.get(Transform).rotation.setFromEuler(directionNeg);

        camera.add(Follow, {
          target: this.avatar.id,
          offset: this.followOffset,
          lerpAlpha: CAMERA_LERP_ALPHA,
        });

        // Make it easy to get back to avatar if camera not centered
        if (this.ecsWorld.version % 60 === 0 && this.isOffCenter()) {
          centerCameraVisible.set(true);
        }

        break;
      }

      case "above": {
        this.followOffset.set(0, this.state.height, 0).add(this.pan);

        camera.add(Follow, {
          target: this.avatar.id,
          offset: this.followOffset,
          lerpAlpha: CAMERA_LERP_ALPHA,
        });

        break;
      }
    }
  }

  setPan(x: number, z: number) {
    this.pan.x = x;
    this.pan.y = AVATAR_HEIGHT;
    this.pan.z = z;
  }

  setFov(fov: number) {
    this.ecsWorld.presentation.camera.fov = fov;
    this.ecsWorld.presentation.camera.updateProjectionMatrix();
    this.ecsWorld.cssPresentation.camera.fov = fov;
    this.ecsWorld.cssPresentation.camera.updateProjectionMatrix();
  }

  setZoomRange(min: number, max: number) {
    if (min < 0) min = 0;
    if (max < min) max = min;
    this.zoomedInDistance = min;
    this.zoomedOutDistance = max;
  }

  getFov() {
    return this.ecsWorld.presentation.camera.fov;
  }

  calcFollowOffset() {
    directionNeg.set(
      -this.direction.x,
      this.direction.y,
      this.direction.z,
      "YXZ"
    );

    const range = this.zoomedOutDistance - this.zoomedInDistance;
    this.followOffset
      .set(0, 0, 1)
      .applyEuler(directionNeg)
      .multiplyScalar(this.zoomedInDistance + range * this.zoom)
      .add(this.pan);
  }

  /**
   * Camera Modes
   */

  // "above" mode looks directly down from high above
  setModeAbove(height: number = 30) {
    this.state = {
      type: "above",
      height,
    };

    this.entity
      .get(Transform)
      .rotation.copy(
        new Quaternion().setFromEuler(new Euler((Math.PI * 3) / 2, 0, 0, "XYZ"))
      );
  }

  // "follow" mode follows the avatar
  setModeFollow() {
    this.state = { type: "follow" };
  }
}
