import { Vector3 } from "three";

import { difference } from "~/utils/setOps";
import { AVATAR_HEIGHT } from "~/config/constants";

import { Entity, System } from "~/ecs/base";
import { Presentation, Transform } from "~/ecs/plugins/core";
import { Translucent } from "~/ecs/plugins/translucent";

import { Perspective } from "../Perspective";
import { Physics } from "../../physics";
import { Ray, RayColliderIntersection } from "@dimforge/rapier3d";

const vDir = new Vector3();
const entitiesBetween: Set<Entity> = new Set();
const emptySet: Set<Entity> = new Set();

export class PerspectiveSystem extends System {
  physics: Physics;
  perspective: Perspective;
  presentation: Presentation;

  entitiesWeMadeTranslucent: Set<Entity> = new Set();
  target: Vector3 = new Vector3();

  init({ physics, perspective, presentation }) {
    this.physics = physics;
    this.perspective = perspective;
    this.presentation = presentation;
  }

  update() {
    this.perspective.update();
    this.updateTranslucentObjectsBlockingView();
  }

  updateTranslucentObjectsBlockingView() {
    const blockingEntities = this.getVisuallyBlockingEntities();

    for (let entity of blockingEntities) {
      if (entity && !this.entitiesWeMadeTranslucent.has(entity)) {
        entity.add(Translucent);
        this.entitiesWeMadeTranslucent.add(entity);
      }
    }

    const noLongerTranslucents: Set<Entity> = difference(
      this.entitiesWeMadeTranslucent,
      blockingEntities
    );
    for (let entity of noLongerTranslucents) {
      entity.remove(Translucent);
      this.entitiesWeMadeTranslucent.delete(entity);
    }
  }

  fastFindBetween(source: Vector3, target: Vector3) {
    vDir.copy(target).sub(source).normalize();
    const ray: Ray = new this.physics.rapier.Ray(source, vDir);
    const distance = source.distanceTo(target);

    entitiesBetween.clear();

    this.physics.world.intersectionsWithRay(
      ray,
      distance,
      false,
      0xffffffff,
      (intersect: RayColliderIntersection) => {
        const entity = this.physics.colliders.get(intersect.collider.handle);
        entitiesBetween.add(entity);
        return true;
      }
    );

    return entitiesBetween;
  }

  getVisuallyBlockingEntities(): Set<Entity> {
    const source = this.presentation.camera.parent?.position;
    const transform = this.perspective.avatar?.get(Transform);
    if (source && transform) {
      this.target.copy(transform.position);
      this.target.y += AVATAR_HEIGHT / 2;
      if (source) {
        const entities: Set<Entity> = this.fastFindBetween(source, this.target);
        entities.delete(this.perspective.avatar);
        return entities;
      }
    }
    return emptySet;
  }
}
