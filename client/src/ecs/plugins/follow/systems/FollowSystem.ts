import { Vector3 } from "three";

import { Groups, System } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";

import { Follow } from "../components";

const targetPosition = new Vector3();
export class FollowSystem extends System {
  order = Groups.Initialization;

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

    const targetTransform: Transform = targetEntity.get(Transform);
    if (!targetTransform) return;

    targetPosition.copy(targetTransform.positionWorld);
    targetPosition.add(spec.offset);

    if (transform.position.equals(targetPosition)) {
      // Do nothing
    } else if (transform.position.distanceToSquared(targetPosition) < 0.0001) {
      transform.position.copy(targetPosition);
      transform.modified();
    } else {
      transform.position.lerp(targetPosition, spec.lerpAlpha);
      transform.modified();
    }
  }
}
