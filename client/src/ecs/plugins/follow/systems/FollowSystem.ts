import { Vector3, MathUtils } from "three";

import { Groups, System } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";

import { Follow } from "../components";

const DECEL_RADIUS = 2;
const DAMPENING_CONSTANT = 5;

const targetPosition = new Vector3();
const vector = new Vector3();

export class FollowSystem extends System {
  order = Groups.Initialization;

  static queries = {
    active: [Follow],
  };

  update() {
    this.queries.active.forEach((entity) => {
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

    const distance = transform.position.distanceTo(targetPosition);

    let speed = 0;

    if (distance === 0) {
      // arrived; do nothing
    } else {
      speed =
        MathUtils.clamp(distance, 0, DECEL_RADIUS) /
        DECEL_RADIUS /
        (spec.dampening * DAMPENING_CONSTANT);

      // arrow pointing to where we need to go
      vector.copy(targetPosition).sub(transform.position);
      if (vector.length() > speed) {
        vector.normalize().multiplyScalar(speed);
      } else {
        // small vector; will soon arrive
      }

      transform.position.add(vector);
      transform.modified();
    }
  }
}
