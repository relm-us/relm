import * as THREE from "three";
import { System, Groups } from "~/ecs/base";
import { WorldTransform, Transform } from "~/ecs/plugins/core";

import { Follow } from "../components";

const targetPosition = new THREE.Vector3();
const position = new THREE.Vector3();

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
    const spec = entity.get(Follow);
    const targetId = spec.entity;

    const transform = entity.get(Transform);

    const targetEntity = world.entities.getById(targetId);
    if (!targetEntity) return;

    const targetWorld = targetEntity.get(WorldTransform) as any;
    if (!targetWorld) return;

    targetPosition.copy(targetWorld.position);

    position.set(
      targetWorld.position.x,
      targetWorld.position.y,
      targetWorld.position.z
    );
    position.add(spec.offset);
    transform.position.lerp(position, spec.lerpAlpha);
  }
}
