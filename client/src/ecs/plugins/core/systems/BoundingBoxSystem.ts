import { System, Not, Modified, Groups, Entity } from "~/ecs/base";
import { Object3DRef, Transform } from "../components";
import { Queries } from "~/ecs/base/Query";
import { Presentation } from "..";
import { BoundingBox } from "../components/BoundingBox";
import { Object3D } from "three";

export class BoundingBoxSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization - 300;

  static queries: Queries = {
    new: [Transform, Object3DRef, Not(BoundingBox)],
    modified: [Modified(Transform), Object3DRef, BoundingBox],
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
