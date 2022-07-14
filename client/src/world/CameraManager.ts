import { Euler, PerspectiveCamera, Quaternion, Vector3 } from "three";

import { Entity } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { Follow } from "~/ecs/plugins/follow";
import { LookAt } from "~/ecs/plugins/look-at";

import { viewportScale } from "~/stores";
import { centerCameraVisible } from "~/stores/centerCameraVisible";

import { makeCamera } from "~/prefab/makeCamera";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import {
  AVATAR_HEIGHT,
  CAMERA_FOCUS_DISTANCE,
  CAMERA_LERP_ALPHA,
} from "~/config/constants";

type CameraFollowingParticipant = {
  type: "following";
};

type CameraFocusing = {
  type: "focusing";

  // Entity to focus in on
  target: Entity;
};

type CameraDefocusing = {
  type: "defocusing";

  // Count frames since defocus started
  frames: number;
};

type CameraCircling = {
  type: "circling";

  target: Entity;

  height: number;

  radius: number;

  radians: number;

  radianStep: number;
};

type CameraAbove = {
  type: "above";
  height: number;
};

type CameraState =
  | CameraFollowingParticipant
  | CameraFocusing
  | CameraDefocusing
  | CameraCircling
  | CameraAbove;

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
  zoomedInOffset: Vector3 = new Vector3(0, 5.5, 5.0);
  zoomedOutOffset: Vector3 = new Vector3(0, 25.5, 25.0);

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
    this.zoom = 0.5;

    this.followOffset = new Vector3().copy(this.zoomedOutOffset);

    // Create the ECS camera entity that holds the ThreeJS camera
    this.entity = makeCamera(this.ecsWorld)
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
        this.followOffset
          .copy(this.zoomedInOffset)
          .lerp(this.zoomedOutOffset, this.zoom)
          .add(this.pan);
        const follow = camera.get(Follow);
        follow?.offset.copy(this.followOffset);

        // Make it easy to get back to avatar if camera not centered
        if (this.counter % 60 === 0 && this.isOffCenter()) {
          centerCameraVisible.set(true);
        }

        break;
      }
      case "focusing": {
        break;
      }
      case "defocusing": {
        this.state.frames++;
        if (this.state.frames++ >= 12) {
          this.defocusDone();
        }
        break;
      }
      case "circling": {
        this.state.radians += this.state.radianStep;
        updateComponent(camera, Follow, {
          target: this.state.target.id,
          offset: new Vector3(
            Math.cos(this.state.radians) * this.state.radius,
            this.state.height,
            Math.sin(this.state.radians) * this.state.radius
          ),
        });
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

  focus(target: Entity, done: Function) {
    this.state = {
      type: "focusing",
      target,
    };

    const camera = this.entity;
    if (!camera) return;

    updateComponent(camera, Follow, {
      target: target.id,
      offset: new Vector3(0, 0, CAMERA_FOCUS_DISTANCE),
    });

    updateComponent(camera, LookAt, {
      target: target.id,
      offset: new Vector3(0, 0, 0),
      limit: "NONE",
      stepRadians: Math.PI / 32,
      oneShot: false,
    });

    // TODO: make this actually wait until focus is done
    setTimeout(done, 1000);
  }

  followParticipant() {
    const camera = this.entity;
    if (!camera) return;

    if (this.state.type === "following") return;

    if (this.state.type === "focusing") {
      updateComponent(camera, LookAt, {
        target: this.state.target.id,
        offset: new Vector3(0, -1, 0),
        limit: "X_AXIS",
        stepRadians: Math.PI / 64,
      });
    }

    this.state = { type: "defocusing", frames: 0 };

    updateComponent(camera, Follow, {
      target: this.avatar.id,
      offset: new Vector3().copy(this.zoomedInOffset),
    });
  }

  defocusDone() {
    const camera = this.entity;
    if (!camera) return;

    this.state = {
      type: "following",
    };

    updateComponent(camera, LookAt, {
      target: this.avatar.id,
      offset: new Vector3(0, AVATAR_HEIGHT, 0),
      stepRadians: 0,
      // oneShot: true,
    });

    setTimeout(() => {
      // TODO: This hack fixes the weird zoom bug, but makes
      // for a clunky zoom out
      camera.remove(LookAt);
    }, 1000);
  }

  circleAround(
    target: Entity,
    { height = null, radius = 5.0, radians = null, radianStep = 0.01 } = {}
  ) {
    const camera = this.entity;
    if (!camera) return;

    if (radians === null) {
      if (this.state.type === "circling") {
        radians = this.state.radians;
      } else {
        radians = 0;
      }
    }

    if (height === null) {
      const position = this.entity.get(Transform).position;
      height = position.y;
    }

    this.state = {
      type: "circling",
      target,
      height,
      radius,
      radians,
      radianStep,
    };

    updateComponent(camera, LookAt, {
      target: target.id,
      offset: new Vector3(0, 0, 0),
      limit: "NONE",
      stepRadians: radianStep,
      oneShot: false,
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
