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

export class CameraManager {
  counter: number = 0;

  ecsWorld: DecoratedECSWorld;

  // The ECS entity with a Camera component holding the ThreeJS PerspectiveCamera object
  entity: Entity;

  // The participant's avatar
  avatar: Entity;

  // Track what we're doing with the camera right now
  state: CameraState;

  // How much the camera is "off-center" from the participant
  pan: Vector3 = new Vector3();

  // 0: zoomed all the way in; 1: zoomed all the way out
  zoom: number;

  // The angle from which to look down
  angle: number;

  followOffset: Vector3;
  zoomedInDistance: number = 5;
  zoomedInOffset: Vector3 = new Vector3();
  zoomedOutDistance: number = 25;
  zoomedOutOffset: Vector3 = new Vector3();

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

    this.zoom = DEFAULT_VIEWPORT_ZOOM / 100;
    this.angle = DEFAULT_CAMERA_ANGLE;

    this.followOffset = new Vector3();

    // Create the ECS camera entity that holds the ThreeJS camera
    this.entity = makeCamera(this.ecsWorld)
      .add(Follow, {
        target: this.avatar.id,
        lerpAlpha: CAMERA_LERP_ALPHA,
      })
      .activate();

    this.setRotation(this.angle);

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
    if (!camera) return;

    this.counter++;

    switch (this.state.type) {
      case "follow": {
        this.calcFollowOffset();

        camera.add(Follow, {
          target: this.avatar.id,
          offset: this.followOffset,
        });

        // Make it easy to get back to avatar if camera not centered
        if (this.counter % 60 === 0 && this.isOffCenter()) {
          centerCameraVisible.set(true);
        }

        break;
      }

      case "above": {
        this.followOffset.set(0, this.state.height, 0).add(this.pan);

        camera.add(Follow, {
          target: this.avatar.id,
          offset: this.followOffset,
        });

        break;
      }
    }
  }

  setPan(x: number, z: number) {
    this.pan.x = x;
    this.pan.z = z;
  }

  setRotation(angle: number) {
    this.entity
      .get(Transform)
      .rotation.setFromEuler(new Euler(-angle, 0, 0, "XYZ"));
  }

  setFov(fov: number) {
    this.ecsWorld.presentation.camera.fov = fov;
    this.ecsWorld.presentation.camera.updateProjectionMatrix();
    this.ecsWorld.cssPresentation.camera.fov = fov;
    this.ecsWorld.cssPresentation.camera.updateProjectionMatrix();
  }

  getFov() {
    return this.ecsWorld.presentation.camera.fov;
  }

  calcFollowOffset() {
    this.zoomedInOffset.set(
      0,
      this.zoomedInDistance * Math.sin(this.angle) + AVATAR_HEIGHT,
      this.zoomedInDistance * Math.cos(this.angle)
    );

    this.zoomedOutOffset.set(
      0,
      this.zoomedOutDistance * Math.sin(this.angle) + AVATAR_HEIGHT,
      this.zoomedOutDistance * Math.cos(this.angle)
    );

    this.followOffset
      .copy(this.zoomedInOffset)
      .lerp(this.zoomedOutOffset, this.zoom)
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
