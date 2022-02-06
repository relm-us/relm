import { Vector3 } from "three";
import { System, Entity } from "~/ecs/base";

import { Transform, Presentation } from "~/ecs/plugins/core";
import { Transition } from "../components";

const EQUAL_THRESHOLD = 0.0001;

export class TransitionSystem extends System {
  presentation: Presentation;
  cameraId: string;

  order = 3001;

  static queries = {
    active: [Transition],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.active.forEach((entity) => {
      this.step(entity);
    });
  }

  step(entity: Entity) {
    const spec: Transition = entity.get(Transition);
    const transform: Transform = entity.get(Transform);

    if (spec.positionSpeed > 0) {
      transform.position.lerp(spec.position, spec.positionSpeed);
      if (transform.position.distanceTo(spec.position) < EQUAL_THRESHOLD) {
        spec.positionSpeed = 0;
      }
    }

    if (spec.rotationSpeed > 0) {
      transform.rotation.slerp(spec.rotation, spec.rotationSpeed);
      if (transform.rotation.angleTo(spec.rotation) < EQUAL_THRESHOLD) {
        spec.rotationSpeed = 0;
      }
    }

    if (spec.scaleSpeed > 0) {
      transform.scale.lerp(spec.scale, spec.scaleSpeed);
      if (transform.scale.distanceTo(spec.scale) < EQUAL_THRESHOLD) {
        spec.scaleSpeed = 0;
      }
    }

    if (
      spec.positionSpeed == 0 &&
      spec.rotationSpeed == 0 &&
      spec.scaleSpeed == 0
    ) {
      this.remove(entity);
      // TODO: Figure out why the collider isn't solid until the end
      // Let physics engine catch up with new position
      transform.modified();
    }
  }

  remove(entity: Entity) {
    entity.remove(Transition);
  }
}
