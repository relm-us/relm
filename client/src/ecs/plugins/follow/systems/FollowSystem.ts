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

    const targetTransform: Transform = world.entities
      .getById(spec.target)
      ?.get(Transform);
    if (!targetTransform) return;

    targetPosition.copy(targetTransform.positionWorld);
    targetPosition.add(spec.offset);

    const isTinyDistance =
      transform.position.distanceToSquared(targetPosition) < 0.0001;

    if (transform.position.equals(targetPosition)) {
      // Do nothing
    } else {
      transform.position.lerp(
        targetPosition,
        isTinyDistance ? 1.0 : spec.lerpAlpha
      );
      transform.modified();
    }
  }
}
