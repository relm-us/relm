import { Vector3 } from "three";

import { System, Groups, Not } from "~/ecs/base";
import { WorldTransform } from "~/ecs/plugins/core";

import { Presentation } from "~/ecs/plugins/core/Presentation";
import { WorldPlanes } from "~/ecs/shared/WorldPlanes";

import { PointerPosition, PointerPositionRef } from "../components";

export class PointerPositionSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization + 10;

  static queries = {
    added: [WorldTransform, PointerPosition, Not(PointerPositionRef)],
    active: [PointerPosition, PointerPositionRef],
    removed: [Not(PointerPosition), PointerPositionRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.active.forEach((entity) => {
      const ref = entity.get(PointerPositionRef);
      if (!ref) return;

      const planes: WorldPlanes = ref.value;
      planes.update(this.presentation.mouse2d);

      ref.updateCount++;
    });

    this.queries.removed.forEach((entity) => {
      this.release(entity);
    });
  }

  build(entity) {
    const spec = entity.get(PointerPosition);
    const world = entity.get(WorldTransform);

    const value = new WorldPlanes(
      this.presentation.camera,
      this.presentation.size,
      world.position,
      spec.offset
    );
    entity.add(PointerPositionRef, { value });
  }

  release(entity) {
    entity.remove(PointerPositionRef);
  }
}
