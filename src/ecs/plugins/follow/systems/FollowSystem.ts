import * as THREE from "three";
import { System, Groups } from "hecs";
import { ComposableTransform } from "~/ecs/plugins/composable";
import { WorldTransform, Transform } from "hecs-plugin-core";

import { Follow } from "../components";

const targetPosition = new THREE.Vector3();
const position = new THREE.Vector3();

export class FollowSystem extends System {
  order = Groups.Initialization;

  static queries = {
    targeted: [Follow],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.targeted.forEach((entity) => {
      const spec = entity.get(Follow);
      this.follow(entity, spec.entity, spec.limit);
    });
  }

  follow(entity, targetId, limit) {
    const transform = entity.get(ComposableTransform);
    const world = entity.get(WorldTransform);

    const targetEntity = this.world.entities.getById(targetId);
    if (!targetEntity) return;

    const targetWorld = targetEntity.get(WorldTransform);
    if (!targetWorld) return;

    targetPosition.copy(targetWorld.position);
    position.copy(world.position);

    if (limit === "X_AXIS") {
      transform.position.x = targetWorld.position.x;
    } else if (limit === "Y_AXIS") {
      transform.position.y = targetWorld.position.y;
    } else if (limit === "Z_AXIS") {
      transform.position.z = targetWorld.position.z;
    }

    const parent = entity.getParent();
    if (parent) {
      // m1.extractRotation(parent.get(WorldTransform).matrix)
      // q1.setFromRotationMatrix(m1)
      // transform.rotation.premultiply(q1.inverse())
    }
  }
}
