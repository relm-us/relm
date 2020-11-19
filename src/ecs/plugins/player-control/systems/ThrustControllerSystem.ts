import { System, Groups } from "hecs";
import { WorldTransform, Transform } from "hecs-plugin-core";
import { Object3D } from "hecs-plugin-three";
import { get } from "svelte/store";

import { keyUp, keyDown, keyLeft, keyRight, keySpace } from "~/input";
import { ThrustController } from "../components";
import { RigidBodyRef } from "~/ecs/plugins/rapier/components/RigidBodyRef";
import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors";
import { Vector3, Euler, Quaternion, ArrowHelper } from "three";
import { PointerPlaneRef } from "~/ecs/plugins/pointer-plane";

const bodyFacing = new Vector3();
const thrust = new Vector3();
const vUp = new Vector3(0, 1, 0);
const vOut = new Vector3(0, 0, 1);
const v1 = new Vector3();
const q = new Quaternion();

const MAX_VELOCITY = 5.0;
const MIN_DIRECTION_THRUST = 0.01;
const UPRIGHT_SPEED = 0.05;

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
    const world = entity.get(WorldTransform);
    const transform = entity.get(Transform);

    bodyFacing.copy(vOut);
    bodyFacing.applyQuaternion(transform.rotation);

    thrust.set(
      (directions.left ? -1 : 0) + (directions.right ? 1 : 0),
      directions.jump ? 1 : 0,
      (directions.up ? -1 : 0) + (directions.down ? 1 : 0)
    );
    const angle = signedAngleBetweenVectors(bodyFacing, thrust, vUp);

    // pull character upright if leaning in any direction
    const euler = new Euler(0, 0, 0, "YXZ").setFromQuaternion(
      transform.rotation
    );
    euler.x = 0;
    euler.z = 0;
    q.setFromEuler(euler).normalize();
    transform.rotation.rotateTowards(q, UPRIGHT_SPEED);

    if (thrust.lengthSq() < MIN_DIRECTION_THRUST) {
      // Do nothing
    } else if (angle < -Math.PI / 12 || angle > Math.PI / 12) {
      v1.copy(bodyRef.value.linvel());
      // maximum velocity
      if (v1.length() < MAX_VELOCITY) {
        // less thrust when not facing direction
        thrust.multiplyScalar(controller.thrust / 7);
        bodyRef.value.applyForce(thrust, true);
      }
      // turn toward direction
      thrust.set(0, Math.sign(angle) * 20, 0);
      bodyRef.value.applyTorque(thrust, true);
      // TODO: suspend head-turning while changing directions
    } else {
      // thrust toward direction
      v1.copy(bodyRef.value.linvel());
      // maximum velocity
      if (v1.length() < MAX_VELOCITY) {
        thrust.multiplyScalar(controller.thrust);
        bodyRef.value.applyForce(thrust, true);
      }
    }
  }
}
