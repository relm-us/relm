import { Vector3, MathUtils } from "three";

import { Entity, Groups, System } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { easeTowards } from "~/ecs/shared/easeTowards";

import { Follow, FollowPoint } from "../components";

const DECEL_RADIUS = 2;
const DAMPENING_CONSTANT = 5;

const v1 = new Vector3();
const v2 = new Vector3();

export class FollowSystem extends System {
  order = Groups.Initialization;

  static queries = {
    active: [Follow],
    activePoint: [FollowPoint],
  };

  update() {
    this.queries.active.forEach((entity) => {
      const spec: Follow = entity.get(Follow);
      this.getTargetFromFollow(spec, v1);
      this.follow(entity, v1, spec.dampening);
    });

    this.queries.activePoint.forEach((entity) => {
      const spec: FollowPoint = entity.get(FollowPoint);
      this.follow(entity, spec.target, spec.dampening);
    });
  }

  follow(entity: Entity, target: Vector3, dampening: number) {
    const transform: Transform = entity.get(Transform);
    easeTowards(transform.position, target, dampening);
    transform.modified();
  }

  getTargetFromFollow(spec: Follow, result: Vector3) {
    const targetTransform: Transform = this.world.entities
      .getById(spec.target)
      ?.get(Transform);
    if (!targetTransform) return;

    result.copy(targetTransform.positionWorld);
    result.add(spec.offset);
  }
}
