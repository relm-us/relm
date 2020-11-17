import { System, Groups } from "hecs";
import { Vector3 } from "hecs-plugin-core";
import { get } from "svelte/store";

import { keyUp, keyDown, keyLeft, keyRight, keySpace } from "~/input";
import { ThrustController } from "../components";
import { RigidBodyRef } from "~/ecs/plugins/rapier/components/RigidBodyRef";

const thrust = new Vector3();

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

    thrust.set(0, 0, 0);
    switch (controller.plane) {
      case "XZ":
        thrust.set(
          ((directions.left ? -1 : 0) + (directions.right ? 1 : 0)) *
            controller.thrust,
          (directions.jump ? 1 : 0) * controller.thrust,
          // 0,
          ((directions.up ? -1 : 0) + (directions.down ? 1 : 0)) *
            controller.thrust
        );
        break;
      case "XY":
        thrust.set(
          ((directions.left ? -1 : 0) + (directions.right ? 1 : 0)) *
            controller.thrust,
          ((directions.up ? 1 : 0) + (directions.down ? -1 : 0)) *
            controller.thrust,
          0
        );
        break;
      default:
        throw new Error(`Unknown controller plane: ${controller.plane}`);
    }
    bodyRef.value.applyForce(thrust, true);
  }
}
