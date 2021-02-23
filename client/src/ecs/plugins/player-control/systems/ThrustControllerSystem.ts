import { System, Groups } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { get } from "svelte/store";

import { keyUp, keyDown, keyLeft, keyRight, keySpace } from "~/input";
import { ThrustController, HeadController } from "../components";
import { RigidBodyRef } from "~/ecs/plugins/rapier/components/RigidBodyRef";
import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors";
import { Vector3, Euler, Quaternion } from "three";
import { RigidBody } from "@dimforge/rapier3d";

const bodyFacing = new Vector3();
const thrust = new Vector3();
const torque = new Vector3();
const vUp = new Vector3(0, 1, 0);
const vOut = new Vector3(0, 0, 1);
const v1 = new Vector3();

const MAX_VELOCITY = 5.0;

export class ThrustControllerSystem extends System {
  order = Groups.Simulation;

  static queries = {
    default: [ThrustController, RigidBodyRef],
  };

  update() {
    const directions = {
      up: get(keyUp),
      down: get(keyDown),
      left: get(keyLeft),
      right: get(keyRight),
      jump: get(keySpace),
    };
    this.queries.default.forEach((entity) => {
      this.applyThrust(directions, entity);
    });
  }

  applyThrust(directions, entity) {
    const controller = entity.get(ThrustController);
    const bodyRef = entity.get(RigidBodyRef);
    const transform = entity.get(Transform);

    bodyFacing.copy(vOut);
    bodyFacing.applyQuaternion(transform.rotation);

    thrust
      .set(
        (directions.left ? -1 : 0) + (directions.right ? 1 : 0),
        0, //
        (directions.up ? -1 : 0) + (directions.down ? 1 : 0)
      )
      .normalize();

    const angle = signedAngleBetweenVectors(bodyFacing, thrust, vUp);
    if (angle < -Math.PI / 12 || angle > Math.PI / 12) {
      // turn toward direction
      torque.set(0, Math.sign(angle) * controller.torque, 0);
      bodyRef.value.applyTorque(torque, true);
    }

    v1.copy(bodyRef.value.linvel());
    v1.y = 0;
    let velocity = v1.length();

    // thrust toward direction if under maximum velocity
    thrust.multiplyScalar(-controller.thrust);
    v1.multiplyScalar(-1);
    v1.sub(thrust);
    bodyRef.value.applyForce(v1, true);

    // jump/fly
    // simple hack: y is up, so don't let thrust be more than positive max velocity
    if (bodyRef.value.linvel().y < MAX_VELOCITY) {
      thrust.set(0, directions.jump ? controller.thrust : 0, 0);
      bodyRef.value.applyForce(thrust, true);
    }
  }
}
