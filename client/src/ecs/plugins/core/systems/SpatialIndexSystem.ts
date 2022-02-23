import { Queries } from "~/ecs/base/Query";
import { System, Not, Modified, Groups } from "~/ecs/base";
import {
  BoundingBox,
  SpatiallyIndexed,
  Transform,
} from "../components";

import { Presentation } from "..";

export class SpatialIndexSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization - 200;

  static queries: Queries = {
    new: [BoundingBox, Not(SpatiallyIndexed)],
    modified: [Modified(BoundingBox), SpatiallyIndexed],
    removed: [Not(BoundingBox), SpatiallyIndexed],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.new.forEach((entity) => {
      const transform: Transform = entity.get(Transform);
      entity.add(SpatiallyIndexed, { index: transform.positionWorld });
      this.updateIndex(entity);
      this.presentation.spatial.add(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.updateIndex(entity);
    });
    this.queries.removed.forEach((entity) => {
      const spatial: SpatiallyIndexed = entity.get(SpatiallyIndexed);
      this.presentation.spatial.remove(spatial.index);
      entity.remove(SpatiallyIndexed);
    });
  }

  updateIndex(entity) {
    const spatial: SpatiallyIndexed = entity.get(SpatiallyIndexed);

    // Update sptial index, moving from old to new WorldTransform
    this.presentation.spatial.move(spatial.index, entity);
  }
}
