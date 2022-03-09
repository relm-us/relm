import { Object3D } from "three";

import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3DRef, Presentation, Transform } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";

import { BoundingBox } from "../components";

export class BoundingBoxSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization - 300;

  static queries: Queries = {
    new: [Transform, Object3DRef, Not(BoundingBox)],
    modified: [Modified(Transform), Object3DRef, BoundingBox],
    modifiedModel: [Transform, Modified(Object3DRef), BoundingBox],
    removed: [Not(Transform), BoundingBox],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.new.forEach((entity) => {
      entity.add(BoundingBox);
      this.updateBounds(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.updateBounds(entity);
    });

    this.queries.modifiedModel.forEach((entity) => {
      this.updateBounds(entity);
    });

    this.queries.removed.forEach((entity) => {
      entity.remove(BoundingBox);
    });
  }

  updateBounds(entity) {
    const object3d: Object3D = entity.get(Object3DRef).value;
    const boundingBox: BoundingBox = entity.get(BoundingBox);

    boundingBox.box.setFromObject(object3d);
    boundingBox.box.getSize(boundingBox.size);

    boundingBox.modified();
  }
}
