import { Vector3 } from "three";

import { SPATIAL_INDEX_THRESHOLD } from "~/config/constants";

import { Entity, System, Not, Modified, Groups } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";
import { Presentation, Transform } from "~/ecs/plugins/core";
import { BoundingBox } from "~/ecs/plugins/bounding-box";
import { DirectionalLight } from "~/ecs/plugins/lighting";

import { SpatiallyIndexed } from "../components";
import { SpatialIndex } from "../SpatialIndex";

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
    this.presentation.spatial = new SpatialIndex();
  }

  update() {
    this.queries.new.forEach((entity) => {
      this.addOrMove(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.addOrMove(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  getLargestSide(entity: Entity) {
    const boundingBox: BoundingBox = entity.get(BoundingBox);
    return Math.max(boundingBox.size.x, boundingBox.size.y, boundingBox.size.z);
  }

  addOrMove(entity: Entity) {
    const spatial = this.presentation.spatial;

    const transform: Transform = entity.get(Transform);
    const spatially: SpatiallyIndexed = entity.get(SpatiallyIndexed);

    const side = this.getLargestSide(entity);
    const isIndexable =
      side < SPATIAL_INDEX_THRESHOLD && !entity.has(DirectionalLight);

    if (!spatially) {
      if (isIndexable) {
        // Make position unique
        const index = new Vector3()
          .random()
          .divideScalar(100000)
          .add(transform.positionWorld);

        // Check if by random chance something already exists there:
        const alreadyThere = spatial.octree.get(index);
        if (alreadyThere) {
          // prettier-ignore
          console.warn(
            "Spatial index already has element at position", index,
            "alreadyThere:", alreadyThere,
            "entity:", entity
          );
        }

        // Register entity in octree and remember lookup index
        spatial.octree.set(index, entity);
        entity.add(SpatiallyIndexed, { index });
      } else {
        spatial.fallback.add(entity);
        entity.add(SpatiallyIndexed, { index: null });
      }
      return;
    }

    const wasFallback = spatial.fallback.has(entity);

    if (isIndexable && wasFallback) {
      // Move it from 'fallback' set to indexed set
      spatial.fallback.delete(entity);
      spatial.octree.set(transform.positionWorld, entity);
      spatially.index = transform.positionWorld;
    } else if (isIndexable && !wasFallback) {
      // Assume it has been added before, since this is a 'move' op
      const newIndex = new Vector3()
        .random()
        .divideScalar(100000)
        .add(transform.positionWorld);
      spatial.octree.move(spatially.index, newIndex);
      spatially.index = newIndex;
    } else if (!isIndexable && wasFallback) {
      // Do nothing; already in fallback
    } else if (!isIndexable && !wasFallback) {
      // Last resort--can't be indexed, must go to fallback set
      spatial.fallback.add(entity);
      spatially.index = null;
    }
  }

  remove(entity: Entity) {
    const spatially: SpatiallyIndexed = entity.get(SpatiallyIndexed);
    if (spatially.index) {
      this.presentation.spatial.octree.remove(spatially.index);
    } else {
      this.presentation.spatial.fallback.delete(entity);
    }
    entity.remove(SpatiallyIndexed);
  }
}
