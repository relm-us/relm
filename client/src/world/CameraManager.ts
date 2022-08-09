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
  CAMERA_ANGLE,
  CAMERA_LERP_ALPHA,
  DEFAULT_VIEWPORT_ZOOM,
} from "~/config/constants";

type CameraFollowingParticipant = {
  type: "following";
};

type CameraAbove = {
  type: "above";
  height: number;
};

type CameraState = CameraFollowingParticipant | CameraAbove;

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

  followOffset: Vector3;
  zoomedInOffset: Vector3 = new Vector3(
    0,
    5 * Math.sin(CAMERA_ANGLE) + AVATAR_HEIGHT,
    5 * Math.cos(CAMERA_ANGLE)
  );
  zoomedOutOffset: Vector3 = new Vector3(
    0,
    25 * Math.sin(CAMERA_ANGLE) + AVATAR_HEIGHT,
    25 * Math.cos(CAMERA_ANGLE)
  );

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
    this.state = { type: "following" };
    this.zoom = DEFAULT_VIEWPORT_ZOOM / 100;

    this.followOffset = new Vector3();
    this.calcFollowOffset();

    // Create the ECS camera entity that holds the ThreeJS camera
    this.entity = makeCamera(this.ecsWorld, -CAMERA_ANGLE)
      .add(Follow, {
        target: this.avatar.id,
        lerpAlpha: CAMERA_LERP_ALPHA,
      })
      .activate();

    // Listen to the mousewheel for zoom events
    this.unsubs.push(
      viewportScale.subscribe(($scale) => {
        if (this.state.type === "following") {
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
      case "following": {
        this.calcFollowOffset();
        const follow = camera.get(Follow);
        follow?.offset.copy(this.followOffset);

        // Make it easy to get back to avatar if camera not centered
        if (this.counter % 60 === 0 && this.isOffCenter()) {
          centerCameraVisible.set(true);
        }

        break;
      }

      case "above": {
        this.followOffset.set(0, this.state.height, 0).add(this.pan);
        const follow = camera.get(Follow);
        follow?.offset.copy(this.followOffset);
      }
    }
  }

  setPan(x, z) {
    this.pan.x = x;
    this.pan.z = z;
  }

  setFov(fov) {
    this.ecsWorld.presentation.camera.fov = fov;
    this.ecsWorld.presentation.camera.updateProjectionMatrix();
    this.ecsWorld.cssPresentation.camera.fov = fov;
    this.ecsWorld.cssPresentation.camera.updateProjectionMatrix();
  }

  getFov() {
    return this.ecsWorld.presentation.camera.fov;
  }

  calcFollowOffset() {
    this.followOffset
      .copy(this.zoomedInOffset)
      .lerp(this.zoomedOutOffset, this.zoom)
      .add(this.pan);
  }

  above(height: number = 30) {
    this.state = {
      type: "above",
      height,
    };

    const camera = this.entity;

    camera
      .get(Transform)
      .rotation.copy(
        new Quaternion().setFromEuler(new Euler((Math.PI * 3) / 2, 0, 0, "XYZ"))
      );
  }

  followParticipant() {
    const camera = this.entity;
    if (!camera) return;

    if (this.state.type === "following") return;

    updateComponent(camera, Follow, {
      target: this.avatar.id,
      offset: new Vector3().copy(this.zoomedInOffset),
    });
  }
}

function updateComponent(entity: Entity, Component, attrs: object) {
  if (!entity) return;
  let component = entity.get(Component);
  if (component) {
    Object.assign(component, attrs);
  } else {
    entity.add(Component, attrs);
  }
}
