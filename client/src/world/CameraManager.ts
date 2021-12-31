import { Vector3 } from "three";

import { Entity } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { Follow } from "~/ecs/plugins/follow";
import { LookAt } from "~/ecs/plugins/look-at";

import { viewportScale } from "~/stores";

import { makeCamera } from "~/prefab/makeCamera";
import { DecoratedECSWorld } from "types/DecoratedECSWorld";

function updateComponent(entity: Entity, Component, attrs: object) {
  if (!entity) return;
  let component = entity.get(Component);
  if (component) {
    Object.assign(component, attrs);
  } else {
    entity.add(Component, attrs);
  }
}

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

type CameraState =
  | CameraFollowingParticipant
  | CameraFocusing
  | CameraDefocusing
  | CameraCircling;

const AVATAR_HEIGHT = 1.5;
const FOCUS_DISTANCE = 5.0;
const CAMERA_LERP_ALPHA = 0.125;

export class CameraManager {
  ecsWorld: DecoratedECSWorld;

  // The ECS entity with a Camera component holding the ThreeJS PerspectiveCamera object
  entity: Entity;

  // The participant's avatar
  avatar: Entity;

  // Track what we're doing with the camera right now
  state: CameraState = { type: "following" };

  // How much the camera is "off-center" from the participant
  pan: Vector3 = new Vector3();

  // 0: zoomed all the way in; 1: zoomed all the way out
  zoom: number = 0.5;

  followOffset: Vector3 = new Vector3();
  lookAtOffset: Vector3 = new Vector3();
  zoomedInOffset: Vector3 = new Vector3(0, 5.5, 5.0);
  zoomedOutOffset: Vector3 = new Vector3(0, 25.5, 25.0);

  constructor(ecsWorld: DecoratedECSWorld, avatar: Entity) {
    this.ecsWorld = ecsWorld;
    this.avatar = avatar;
  }

  init() {
    // Create the ECS camera entity that holds the ThreeJS camera
    this.entity = makeCamera(this.ecsWorld)
      .add(Follow, {
        target: this.avatar.id,
        offset: new Vector3().copy(this.zoomedInOffset),
        lerpAlpha: CAMERA_LERP_ALPHA,
      })
      .activate();

    // Listen to the mousewheel for zoom events
    viewportScale.subscribe(($scale) => {
      if (this.state.type === "following") {
        this.zoom = $scale / 100;
      }
    });
  }

  moveTo(position: Vector3) {
    const transform = this.entity.get(Transform);
    transform.position.copy(position);
  }

  update(delta: number) {
    const camera = this.entity;
    if (!camera) return;

    switch (this.state.type) {
      case "following": {
        this.followOffset
          .copy(this.zoomedInOffset)
          .lerp(this.zoomedOutOffset, this.zoom)
          .add(this.pan);
        const follow = camera.get(Follow);
        follow?.offset.copy(this.followOffset);
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
    }
  }

  setPan(x, z) {
    this.pan.x = x;
    this.pan.z = z;
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
      offset: new Vector3(0, 0, FOCUS_DISTANCE),
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
