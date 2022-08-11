import { get } from "svelte/store";
import { Vector3 } from "three";
import type { RigidBody as RapierRigidBody } from "@dimforge/rapier3d";

import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors";

import { System, Groups, Entity, Not } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { Collider2, Collider2Ref, Physics } from "~/ecs/plugins/physics";
import { Animation } from "~/ecs/plugins/animation";
import { PointerPositionRef } from "~/ecs/plugins/pointer-position";
import { isMakingContactWithGround } from "~/ecs/shared/isMakingContactWithGround";

import { keyUp, keyDown, keyLeft, keyRight, keySpace } from "~/stores/keys";

import { Controller, ControllerState, Repulsive } from "../components";

import {
  transition,
  newKeyState,
  isKeyActive,
  KeyState,
  KPR,
} from "~/ecs/shared/KeyState";
import { WorldPlanes } from "~/ecs/shared/WorldPlanes";
import { FALLING } from "~/config/constants";
import { changeAnimationClip } from "~/identity/Avatar/changeAnimationClip";

const STILL_SPEED = 0;
const WALK_SPEED = 1;
const RUN_SPEED = 2;
const FLYING_SPEED = 3;

const FALL_NORMAL = 1;
const FALL_FAST = 8;

const keysState = {
  left: newKeyState(),
  right: newKeyState(),
  up: newKeyState(),
  down: newKeyState(),
};
const spaceState = newKeyState();

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
const p1 = new Vector3();
const p2 = new Vector3();

const vectorFromKeys = new Vector3();

export class ControllerSystem extends System {
  physics: Physics;

  order = Groups.Simulation;

  static queries = {
    added: [Controller, Not(ControllerState)],
    active: [Controller, ControllerState, Transform, Collider2Ref],
    repulsive: [Repulsive, Transform],
  };

  init({ physics }) {
    this.physics = physics;
  }

  update() {
    // Keep global state for each keyboard key
    transition(keysState.left, get(keyLeft));
    transition(keysState.right, get(keyRight));
    transition(keysState.up, get(keyUp));
    transition(keysState.down, get(keyDown));
    transition(spaceState, get(keySpace));

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

      // Override speed if flying
      if (spec.canFly) {
        this.considerFlying(entity, state, spec.thrusts[FLYING_SPEED]);
      }

      const rigidBody: RapierRigidBody = entity.get(Collider2Ref)?.body;
      if (rigidBody) {
        rigidBody.setGravityScale(
          state.grounded || spec.canFly ? FALL_NORMAL : FALL_FAST,
          false
        );
        rigidBody.setAngularDamping(spec.angDamps[state.speed]);
        rigidBody.setLinearDamping(spec.linDamps[state.speed]);
      }

      const angle = this.torqueTowards(
        entity,
        state.direction,
        spec.torques[state.speed]
      );
      if (!state.animOverride)
        this.thrustTowards(entity, state.direction, spec.thrusts[state.speed]);

      const appliedForce = this.repelFromOthers(entity);

      if (state.speed > 0 || angle > 0 || appliedForce) {
        spec.onActivity?.();
      }

      let newFriction;
      if (state.speed === STILL_SPEED) {
        newFriction = 1.5;
      } else {
        newFriction = 0.01;
      }

      const collider: Collider2 = entity.get(Collider2);
      if (collider.friction !== newFriction) {
        collider.friction = newFriction;
        collider.modified();
      }

      const anim: Animation = entity.get(Animation);
      if (anim) {
        if (state.animOverride) {
          changeAnimationClip(
            entity,
            state.animOverride.clipName,
            state.animOverride.loop
          );
        } else {
          const wGrounded = this.willBeGrounded(entity);
          let targetAnim = spec.animations[state.speed];
          if (!state.grounded && !spec.canFly && !wGrounded) {
            // Falling
            state.speed = STILL_SPEED;
            targetAnim = FALLING;
          } else {
            targetAnim = spec.animations[state.speed];
          }
          changeAnimationClip(entity, targetAnim, true);
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
    const transform = entity.get(Transform);
    return isMakingContactWithGround(this.physics, transform.position);
  }

  willBeGrounded(entity: Entity) {
    const transform = entity.get(Transform);

    // check if there will be ground in the direction the avatar is headed...
    p1.copy(vOut);
    p1.applyQuaternion(transform.rotation);
    // about 1/4 unit "away" from the avatar
    p1.multiplyScalar(0.25);
    // and 3/4 units "down"
    p1.y -= 0.75;

    p1.add(transform.position);

    return (
      isMakingContactWithGround(this.physics, transform.position) ||
      isMakingContactWithGround(this.physics, p1)
    );
  }

  useKeys(state: ControllerState) {
    state.speed = getSpeedFromKeysState();
    state.direction = getVectorFromKeys();
  }

  useTouch(entity: Entity, state: ControllerState) {
    const pointer: WorldPlanes = entity.get(PointerPositionRef)?.value;
    if (pointer) {
      const position = entity.get(Transform).position;

      vDir.copy(pointer.points.XZ).sub(position);
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

  considerFlying(
    entity: Entity,
    state: ControllerState,
    thrustMagnitude: number
  ) {
    const body: RapierRigidBody = entity.get(Collider2Ref).body;

    if (isKeyActive(spaceState)) {
      vDir.copy(vUp).multiplyScalar(thrustMagnitude);
      body.addForce(vDir, true);
    }

    // Call on alternate damping values & flying animation
    if (!state.grounded) {
      state.speed = FLYING_SPEED;
    }
  }

  torqueTowards(entity: Entity, direction: Vector3, torqueMagnitude: number) {
    const body: RapierRigidBody = entity.get(Collider2Ref).body;
    const rotation = entity.get(Transform).rotation;

    bodyFacing.copy(vOut);
    bodyFacing.applyQuaternion(rotation);

    const angle = signedAngleBetweenVectors(bodyFacing, direction, vUp);
    torque.set(0, angle * torqueMagnitude, 0);
    body.addTorque(torque, true);

    return angle;
  }

  thrustTowards(entity: Entity, direction: Vector3, thrustMagnitude: number) {
    const body: RapierRigidBody = entity.get(Collider2Ref).body;

    thrust.copy(direction);
    thrust.multiplyScalar(thrustMagnitude);
    body.addForce(thrust, true);
  }

  repelFromOthers(entity: Entity) {
    const body: RapierRigidBody = entity.get(Collider2Ref).body;

    p1.copy(entity.get(Transform).position);
    // Add a little noise so that if entities are exactly on
    // top of each other, they can still move apart.
    p1.x += (Math.random() - 0.5) / 100;
    p1.z += (Math.random() - 0.5) / 100;

    let appliedForce = false;
    this.queries.repulsive.forEach((repelEntity) => {
      if (repelEntity === entity) return;
      p2.copy(repelEntity.get(Transform).position);
      const distance = Math.max(0.5, p1.distanceTo(p2));
      if (distance <= 1.25) {
        const distanceSq = distance * distance;
        vDir
          .copy(p1)
          .sub(p2)
          .normalize()
          .divideScalar(distanceSq)
          .multiplyScalar(2);
        body.addForce(vDir, true);

        // TODO: don't use magic number 1.0
        // NOTE: 0.75 is approx. "stationary"
        if (distanceSq > 1.0) {
          appliedForce = true;
        }
      }
    });

    return appliedForce;
  }
}
