import { Vector3 } from "three";
import { System, Groups } from "~/ecs/base";
import { WorldTransform, Transform } from "~/ecs/plugins/core";

import { Follow } from "../components";

export class FollowSystem extends System {
  // order = Groups.Simulation;
  order = 3000;

  static queries = {
    targeted: [Follow],
  };

  update() {
    this.queries.targeted.forEach((entity) => {
      this.follow(this.world, entity);
    });
  }

  follow(world, entity) {
    const spec: Follow = entity.get(Follow);
    const targetId = spec.target;

    const transform = entity.get(Transform);

    const targetEntity = world.entities.getById(targetId);
    if (!targetEntity) return;

    const targetWorld = targetEntity.get(WorldTransform) as any;
    if (!targetWorld) return;

    if (!spec.targetPosition) {
      // Keep targetPosition around so that other systems such as LookAtSystem
      // can know what target we will eventually follow, once lerp is finished.
      spec.targetPosition = new Vector3();
    }
    spec.targetPosition.copy(targetWorld.position);

    spec.targetPosition.set(
      targetWorld.position.x,
      targetWorld.position.y,
      targetWorld.position.z
    );
    spec.targetPosition.add(spec.offset);
    transform.position.lerp(spec.targetPosition, spec.lerpAlpha);
  }
}
