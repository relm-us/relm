import {
  Euler,
  Matrix4,
  Object3D,
  PerspectiveCamera,
  Quaternion,
  Vector3,
} from "three";

import { Entity } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { Follow } from "~/ecs/plugins/follow";

import { viewportScale } from "~/stores";
import { centerCameraVisible } from "~/stores/centerCameraVisible";

import { makeCamera } from "~/prefab/makeCamera";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import {
  AVATAR_HEIGHT,
  CAMERA_DAMPENING,
  DEFAULT_CAMERA_ANGLE,
  DEFAULT_VIEWPORT_ZOOM,
} from "~/config/constants";
import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors";

type CameraFollow = {
  type: "follow";
};

type CameraRotate = {
  type: "rotate";
};

type CameraAbove = {
  type: "above";
  height: number;
};

type CameraState = CameraFollow | CameraRotate | CameraAbove;

const directionNeg = new Euler();
const vOut = new Vector3(0, 0, -1);
const vUp = new Vector3(0, 1, 0);
const e1 = new Euler();

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
        if (this.state.type === "follow" || this.state.type === "rotate") {
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

        // Roughly "lookAt" the avatar
        this.entity.get(Transform).rotation.setFromEuler(directionNeg);

        camera.add(Follow, {
          target: this.avatar.id,
          offset: this.followOffset,
          dampening: CAMERA_DAMPENING,
        });

        // Make it easy to get back to avatar if camera not centered
        if (this.ecsWorld.version % 60 === 0 && this.isOffCenter()) {
          centerCameraVisible.set(true);
        }

        break;
      }

      case "rotate": {
        const avatarPos: Vector3 = this.avatar.get(Transform).position;
        this.lookAt(avatarPos);

        this.calcFollowOffset();
        camera.add(Follow, {
          target: this.avatar.id,
          offset: this.followOffset,
          dampening: 0.001,
        });

        break;
      }

      case "above": {
        this.followOffset.set(0, this.state.height, 0).add(this.pan);

        camera.add(Follow, {
          target: this.avatar.id,
          offset: this.followOffset,
          dampening: CAMERA_DAMPENING,
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

  lookAt(target: Vector3) {
    const transform: Transform = this.entity.get(Transform);

    const vec = new Vector3().copy(target).sub(transform.position);
    const theta = signedAngleBetweenVectors(vOut, vec, vUp);

    e1.set(-this.direction.x, theta, this.direction.z, "YXZ");
    transform.rotation.setFromEuler(e1);
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

  // "follow" mode follows the avatar
  setModeFollow() {
    this.state = { type: "follow" };
  }

  // "follow" mode follows the avatar
  setModeRotate() {
    this.state = { type: "rotate" };
  }

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
}
