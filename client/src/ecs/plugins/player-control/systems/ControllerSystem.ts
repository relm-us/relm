import { get } from "svelte/store";
import { Vector3 } from "three";
import type { RigidBody } from "@dimforge/rapier3d";

import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors";

import { System, Groups, Entity, Not } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { Physics, RigidBodyRef } from "~/ecs/plugins/physics";
import { Animation } from "~/ecs/plugins/animation";
import { PointerPositionRef } from "~/ecs/plugins/pointer-position";
import { isMakingContactWithGround } from "~/ecs/shared/isMakingContactWithGround";

import { keyUp, keyDown, keyLeft, keyRight, keySpace } from "~/input";

import { Controller, ControllerState } from "../components";

import {
  transition,
  newKeyState,
  isKeyActive,
  KeyState,
  KPR,
} from "../KeyState";

const keysState = {
  left: newKeyState(),
  right: newKeyState(),
  up: newKeyState(),
  down: newKeyState(),
};

function getSpeedFromKeysState() {
  let speed = 0;
  // If any key is in LongPressed or DoublePressed state, shift speed
  for (const keyState of Object.values(keysState)) {
    const ks: KeyState = keyState as KeyState;
    if (ks.state === KPR.LongPressed && speed < 1) speed = 1;
    if (ks.state === KPR.DoublePressed && speed < 2) speed = 2;
  }
  return speed;
}

function getVectorFromKeys() {
  const left = isKeyActive(keysState.left) ? -1 : 0;
  const right = isKeyActive(keysState.right) ? 1 : 0;

  const up = isKeyActive(keysState.up) ? -1 : 0;
  const down = isKeyActive(keysState.down) ? 1 : 0;

  vectorFromKeys.x = left + right;
  vectorFromKeys.z = up + down;

  return vectorFromKeys.normalize();
}

const bodyFacing = new Vector3();
const thrust = new Vector3();
const torque = new Vector3();
const vUp = new Vector3(0, 1, 0);
const vOut = new Vector3(0, 0, 1);
const vDir = new Vector3();

const vectorFromKeys = new Vector3();

export class ControllerSystem extends System {
  physics: Physics;

  order = Groups.Simulation;

  static queries = {
    added: [Controller, Not(ControllerState)],
    active: [Controller, ControllerState, Transform, RigidBodyRef],
  };

  init({ physics }) {
    this.physics = physics;
    (this as any).count = 0;
  }

  update() {
    (this as any).count++;

    // Keep global state for each keyboard key
    transition(keysState.left, get(keyLeft));
    transition(keysState.right, get(keyRight));
    transition(keysState.up, get(keyUp));
    transition(keysState.down, get(keyDown));

    // Make "DoublePressed" key state "sticky" so avatars stay running
    const states = Object.values(keysState);
    const doublePressed = states.some((ks) => ks.state === KPR.DoublePressed);
    if (doublePressed) {
      for (const keyState of Object.values(keysState)) {
        if (keyState.state === KPR.Pressed) keyState.state = KPR.DoublePressed;
      }
    }

    this.queries.added.forEach((entity) => {
      this.initState(entity);
    });

    this.queries.active.forEach((entity) => {
      const spec: Controller = entity.get(Controller);
      const state: ControllerState = entity.get(ControllerState);
      state.grounded = this.isGrounded(entity);

      if (spec.touchEnabled) {
        this.useTouch(entity, state);
      } else if (spec.keysEnabled) {
        this.useKeys(state);
      }

      this.torqueTowards(entity, state.direction, spec.torques[state.speed]);
      this.thrustTowards(entity, state.direction, spec.thrusts[state.speed]);

      const anim = entity.get(Animation);
      if (anim) {
        const targetAnim = spec.animations[state.speed];
        if (anim.clipName !== targetAnim) {
          anim.clipName = targetAnim;
          anim.modified();
        }
      }
    });
  }

  initState(entity: Entity) {
    entity.add(ControllerState, {
      grounded: true,
      speed: 0,
    });
  }

  isGrounded(entity: Entity) {
    const position = entity.get(Transform).position;
    return isMakingContactWithGround(this.physics, position);
  }

  useKeys(state: ControllerState) {
    state.speed = getSpeedFromKeysState();
    state.direction = getVectorFromKeys();
  }

  useTouch(entity: Entity, state: ControllerState) {
    const pointer = entity.get(PointerPositionRef)?.value;
    if (pointer) {
      const position = entity.get(Transform).position;

      vDir.copy(pointer.points.xz).sub(position);
      vDir.y = 0;
      const distance = vDir.length();

      if (distance > 2) {
        state.speed = 2;
      } else if (state.speed === 2 && distance > 0.5 && distance < 1.5) {
        // Switching back to walking shouldn't "flicker" between states, use distance < 1.5
        state.speed = 1;
      } else if (state.speed === 0 && distance > 0.5) {
        state.speed = 1;
      } else if (distance <= 0.5) {
        state.speed = 0;
      }

      vDir.normalize();
      state.direction.copy(vDir);
    }
  }

  torqueTowards(entity: Entity, direction: Vector3, torqueMagnitude: number) {
    const rigidBody: RigidBody = entity.get(RigidBodyRef).value;
    const rotation = entity.get(Transform).rotation;

    bodyFacing.copy(vOut);
    bodyFacing.applyQuaternion(rotation);

    const angle = signedAngleBetweenVectors(bodyFacing, direction, vUp);
    if (angle < -Math.PI / 12 || angle > Math.PI / 12) {
      // turn toward direction
      torque.set(0, Math.sign(angle) * torqueMagnitude, 0);
      rigidBody.applyTorque(torque, true);
    }
  }

  thrustTowards(entity: Entity, direction: Vector3, thrustMagnitude: number) {
    const rigidBody: RigidBody = entity.get(RigidBodyRef).value;

    thrust.copy(direction);
    thrust.multiplyScalar(thrustMagnitude);
    rigidBody.applyForce(thrust, true);
  }
}