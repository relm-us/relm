import * as THREE from "three";
import { System, Groups } from "hecs";
import { WorldTransform, Transform } from "hecs-plugin-core";

import { Follow } from "../components";

const targetPosition = new THREE.Vector3();
const position = new THREE.Vector3();

export class FollowSystem extends System {
  order = Groups.Simulation;

  static queries = {
    targeted: [Follow],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.targeted.forEach((entity) => {
      this.follow(entity);
    });
  }

  follow(entity) {
    const spec = entity.get(Follow);
    const targetId = spec.entity;
    const limit = spec.limit;

    const transform = entity.get(Transform);
    const world = entity.get(WorldTransform);

    const targetEntity = this.world.entities.getById(targetId);
    if (!targetEntity) return;

    const targetWorld = targetEntity.get(WorldTransform);
    if (!targetWorld) return;

    targetPosition.copy(targetWorld.position);

    if (limit === "X_AXIS") {
      position.set(
        targetWorld.position.x,
        transform.position.y,
        transform.position.z
      );
    } else if (limit === "Y_AXIS") {
      position.set(
        transform.position.x,
        targetWorld.position.y,
        transform.position.z
      );
    } else if (limit === "Z_AXIS") {
      position.set(
        transform.position.x,
        transform.position.y,
        targetWorld.position.z
      );
    } else if (limit === "XY_AXIS") {
      position.set(
        targetWorld.position.x,
        targetWorld.position.y,
        transform.position.z
      );
    }
    position.add(spec.offset);
    transform.position.lerp(position, spec.lerpAlpha);

    const parent = entity.getParent();
    if (parent) {
      // m1.extractRotation(parent.get(WorldTransform).matrix)
      // q1.setFromRotationMatrix(m1)
      // transform.rotation.premultiply(q1.inverse())
    }
  }
}
