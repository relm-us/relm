import { System, Groups } from "hecs";
import { Vector3 } from "hecs-plugin-core";
import { get } from "svelte/store";

import { HandController } from "../components";
import { PointerPlaneRef } from "~/ecs/plugins/pointer-plane";
import { RigidBodyRef } from "~/ecs/plugins/rapier/components/RigidBodyRef";

const thrust = new Vector3();

export class HandControllerSystem extends System {
  order = Groups.Simulation;

  static queries = {
    default: [HandController, RigidBodyRef],
  };

  update() {
    this.queries.default.forEach((entity) => {
      this.applyThrust(entity);
    });
  }

  applyThrust(entity) {
    const controller = entity.get(HandController);

    const ppEntity = this.world.entities.getById(controller.pointerPlaneEntity);
    if (!ppEntity) return;

    const pointerPlane = ppEntity.get(PointerPlaneRef);
    const bodyRef = entity.get(RigidBodyRef);

    const target = pointerPlane.XY;
    if (target && get(controller.keyStore)) {
      thrust.copy(target).normalize();
      bodyRef.value.applyForce(thrust, true);
    }
  }
}
