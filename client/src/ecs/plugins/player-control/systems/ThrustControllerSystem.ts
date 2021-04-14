import { get } from "svelte/store";
import { Vector3 } from "three";
import type { Ray, RigidBody } from "@dimforge/rapier3d";

import { AVATAR_INTERACTION } from "~/config/colliderInteractions";
import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors";

import { RigidBodyRef } from "~/ecs/plugins/physics/components/RigidBodyRef";
import { Animation } from "~/ecs/plugins/animation";
import { System, Groups } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { Physics } from "~/ecs/plugins/physics/Physics";

import { keyUp, keyDown, keyLeft, keyRight, keySpace } from "~/input";
import { mode } from "~/stores/mode";

import { ThrustController, HeadController } from "../components";
import { IDLE, WALKING, WAVING } from "../constants";

const bodyFacing = new Vector3();
const thrust = new Vector3();
const torque = new Vector3();
const vUp = new Vector3(0, 1, 0);
const vDown = new Vector3(0, -1, 0);
const vOut = new Vector3(0, 0, 1);
const v1 = new Vector3();
let rayDown: Ray;

const MAX_VELOCITY = 5.0;
const MAX_GROUND_TOI = 1000000;
const CONTACT_TOI = 0.25;

export class ThrustControllerSystem extends System {
  physics: Physics;
  rapier: any;
  count: number;

  order = Groups.Simulation;

  static queries = {
    default: [ThrustController, RigidBodyRef],
  };

  init({ physics }) {
    this.physics = physics;
    rayDown = new this.physics.rapier.Ray(new Vector3(), vDown);
    this.count = 0;
  }

  update() {
    const directions = {
      up: get(keyUp),
      down: get(keyDown),
      left: get(keyLeft),
      right: get(keyRight),
      action: get(keySpace),
      mode: get(mode),
    };

    this.queries.default.forEach((entity) => {
      this.applyThrust(directions, entity);
    });
  }

  applyThrust(directions, entity) {
    const controller = entity.get(ThrustController);
    const rigidBody: RigidBody = entity.get(RigidBodyRef).value;
    const transform = entity.get(Transform);
    const anim = entity.get(Animation);

    const contactBelow = this.isMakingContactBelow(transform.position);

    if (contactBelow) {
      rigidBody.setLinearDamping(20);
      rigidBody.setAngularDamping(25);
      rigidBody.setGravityScale(1, false);
    } else {
      if (directions.mode === "play") {
        rigidBody.setLinearDamping(10);
        rigidBody.setGravityScale(5, false);
      } else if (directions.mode === "build") {
        rigidBody.setLinearDamping(0);
        rigidBody.setGravityScale(1, false);
      }
    }
    // const height;

    bodyFacing.copy(vOut);
    bodyFacing.applyQuaternion(transform.rotation);

    thrust
      .set(
        (directions.left ? -1 : 0) + (directions.right ? 1 : 0),
        0, //
        (directions.up ? -1 : 0) + (directions.down ? 1 : 0)
      )
      .normalize();

    if (directions.action && directions.mode === "play") {
      if (anim.clipName !== WAVING) {
        anim.clipName = WAVING;
        anim.modified();
      }
      return;
    } else if (!contactBelow && directions.mode === "build") {
      if (anim.clipName !== "relaxing-ground") {
        anim.clipName = "relaxing-ground";
        anim.modified();
      }
    } else if (
      thrust.length() < 0.1 ||
      (!contactBelow && directions.mode === "play")
    ) {
      if (anim.clipName !== IDLE) {
        anim.clipName = IDLE;
        anim.modified();
      }
    } else {
      if (anim.clipName !== WALKING) {
        anim.clipName = WALKING;
        anim.modified();
      }
    }

    const angle = signedAngleBetweenVectors(bodyFacing, thrust, vUp);
    if (angle < -Math.PI / 12 || angle > Math.PI / 12) {
      // turn toward direction
      torque.set(0, Math.sign(angle) * controller.torque, 0);
      rigidBody.applyTorque(torque, true);
    }

    v1.copy(rigidBody.linvel() as Vector3);
    v1.y = 0;
    let velocity = v1.length();

    // thrust toward direction if under maximum velocity
    thrust.multiplyScalar(-controller.thrust);
    v1.multiplyScalar(-1);
    v1.sub(thrust);
    rigidBody.applyForce(v1, true);

    // fly
    // simple hack: y is up, so don't let thrust be more than positive max velocity
    if (rigidBody.linvel().y < MAX_VELOCITY && directions.mode === "build") {
      thrust.set(0, directions.action ? controller.thrust : 0, 0);
      rigidBody.applyForce(thrust, true);
    }
  }

  isMakingContactBelow(position) {
    rayDown.origin.x = position.x;
    rayDown.origin.y = position.y;
    rayDown.origin.z = position.z;

    const colliders = this.physics.world.colliders;
    let contactBelow = false;
    if (colliders.len() > 0) {
      this.physics.world.intersectionsWithRay(
        colliders,
        rayDown,
        MAX_GROUND_TOI,
        true,
        AVATAR_INTERACTION,
        (isect) => {
          if (isect.toi < CONTACT_TOI) {
            contactBelow = true;
            // Don't keep looking for more intersections
            return false;
          } else {
            // Keep looking for ground
            return true;
          }
        }
      );
    }

    return contactBelow;
  }
}
