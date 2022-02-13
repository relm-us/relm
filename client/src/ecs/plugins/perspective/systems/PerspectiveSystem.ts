import { Object3D as ThreeObject3D, Vector3 } from "three";

import { difference } from "~/utils/setOps";
import { AVATAR_HEIGHT } from "~/config/constants";

import { Entity, System } from "~/ecs/base";
import { Presentation, Transform, Object3D } from "~/ecs/plugins/core";
import { Translucent } from "~/ecs/plugins/translucent";

import { Perspective } from "../Perspective";

export class PerspectiveSystem extends System {
  perspective: Perspective;
  presentation: Presentation;

  translucentsBefore: Set<Entity> = new Set();
  target: Vector3 = new Vector3();

  init({ perspective, presentation }) {
    this.perspective = perspective;
    this.presentation = presentation;
  }

  update() {
    this.perspective.update();
    this.updateTranslucentObjectsBlockingView();
  }

  updateTranslucentObjectsBlockingView() {
    const blocking = this.getVisuallyBlockingObjects();
    const translucents: Set<Entity> = new Set();
    for (let object of blocking) {
      const entityId = object.userData.entityId;
      const entity: Entity = this.world.entities.getById(entityId);
      if (entity) {
        entity.add(Translucent);
        translucents.add(entity);
      }
    }

    const noLongerTranslucents: Set<Entity> = difference(
      this.translucentsBefore,
      translucents
    );
    for (let entity of noLongerTranslucents) {
      entity.remove(Translucent);
    }

    this.translucentsBefore = translucents;
  }

  getVisuallyBlockingObjects(): Set<ThreeObject3D> {
    const source = this.presentation.camera.parent?.position;
    if (source) {
      if (this.perspective.avatar) {
        this.target.copy(this.perspective.avatar?.get(Transform).position);
        this.target.y += AVATAR_HEIGHT / 2;
        if (source) {
          const objects: Set<ThreeObject3D> =
            this.presentation.intersectionFinder.findBetween(
              source,
              this.target
            );
          objects.delete(this.perspective.avatar?.get(Object3D).value);
          return objects;
        }
      }
    }
    return new Set();
  }
}
