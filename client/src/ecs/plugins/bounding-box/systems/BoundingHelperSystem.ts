import { BoxHelper, Object3D } from "three";

import { System, Groups, Entity, Not } from "~/ecs/base";
import { Object3DRef, Presentation } from "~/ecs/plugins/core";

import { BoundingHelper, BoundingHelperRef } from "../components";

export class BoundingHelperSystem extends System {
  presentation: Presentation;

  order = Groups.Simulation - 1;

  static queries = {
    added: [BoundingHelper, Not(BoundingHelperRef), Object3DRef],
    active: [BoundingHelper, BoundingHelperRef],
    removed: [Not(BoundingHelper), BoundingHelperRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.active.forEach((entity) => {
      this.updatePos(entity);
    });

    this.queries.removed.forEach((entity) => {
      this.release(entity);
    });
  }

  build(entity: Entity) {
    const spec = entity.get(BoundingHelper);
    // TODO: spec.kind === sphere

    const object3d: Object3D = entity.get(Object3DRef).value;

    const box = new BoxHelper(object3d, 0xffff00);

    entity.add(BoundingHelperRef, { value: box });
    this.presentation.scene.add(box);
  }

  updatePos(entity: Entity) {
    const box = entity.get(BoundingHelperRef).value;
    box.update();
  }

  release(entity: Entity) {
    const box: BoxHelper = entity.get(BoundingHelperRef).value;

    entity.remove(BoundingHelperRef);

    this.presentation.scene.remove(box);
  }
}
