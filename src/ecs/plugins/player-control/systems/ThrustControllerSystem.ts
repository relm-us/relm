import { System, Groups } from "hecs";
import { Vector3, Transform } from "hecs-plugin-core";
import { get } from "svelte/store";

import { keyUp, keyDown, keyLeft, keyRight, keySpace } from "~/input";
import { ThrustController } from "../components";
import { RigidBodyRef } from "~/ecs/plugins/rapier/components/RigidBodyRef";
import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors";

const bodyFacing = new Vector3();
const thrust = new Vector3();
const vOut = new Vector3(0, 0, 1);
const vUp = new Vector3(0, 1, 0);

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

    bodyFacing.copy(vOut);
    bodyFacing.applyQuaternion(entity.get(Transform).rotation);

    thrust.set(
      (directions.left ? -1 : 0) + (directions.right ? 1 : 0),
      directions.jump ? 1 : 0,
      (directions.up ? -1 : 0) + (directions.down ? 1 : 0)
    );

    const angle = signedAngleBetweenVectors(bodyFacing, thrust, vUp);

    if (thrust.lengthSq() < 0.01) {
      // Do nothing
    } else if (angle < -Math.PI / 8 || angle > Math.PI / 8) {
      //turn
      thrust.set(0, Math.sign(angle) * 20, 0);
      bodyRef.value.applyTorque(thrust, true);
    } else {
      // thrust
      thrust.multiplyScalar(controller.thrust);
      bodyRef.value.applyForce(thrust, true);
    }
  }
}
