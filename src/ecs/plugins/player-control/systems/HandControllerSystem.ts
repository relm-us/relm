import { System, Groups } from "hecs";
import { Vector3, Transform, WorldTransform } from "hecs-plugin-core";
import { get } from "svelte/store";

import { keyQ, keyE } from "~/input";
import { HandController } from "../components";
import { PointerPlane } from "~/ecs/plugins/pointer-plane";
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

    const pointerPlane = ppEntity.get(PointerPlane);
    const bodyRef = entity.get(RigidBodyRef);

    const target = pointerPlane.XY;
    if (target && get(controller.keyStore)) {
      // thrust.set(0, 0, 0);
      thrust.copy(target).normalize();
      bodyRef.value.applyForce(thrust, true);
      // bodyRef.value.set
      // bodyRef.value.setTranslation(target);
      // console.log("copied", target);
      // const transform = entity.get(Transform);
      // if (transform) {
      //   transform.position.copy(target);
      //   console.log('transform pos A', transform.position)
      // } else {
      //   console.log("no world transform");
      // }
    }
  }
}
