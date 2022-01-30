import { Vector3 } from "three";
import { System, Groups } from "~/ecs/base";
import { WorldTransform, Transform } from "~/ecs/plugins/core";

import { Follow } from "../components";

const targetPosition = new Vector3();
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
    const transform: Transform = entity.get(Transform);

    const targetEntity = world.entities.getById(spec.target);
    if (!targetEntity) return;

    const targetTransform = targetEntity.get(WorldTransform) as any;
    if (!targetTransform) return;

    targetPosition.copy(targetTransform.position);
    targetPosition.add(spec.offset);

    transform.position.lerp(targetPosition, spec.lerpAlpha);
  }
}
