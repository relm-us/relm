import { Frustum, Vector3 } from "three";
import { OctreeIterator, PointOctree } from "relm-common/sparse-octree";

import { Entity } from "~/ecs/base";
import { BoundingBox } from "~/ecs/plugins/bounding-box";
import { DirectionalLight } from "../lighting";

export const WORLD_EXTENT = 250;

export class SpatialIndex {
  octree: PointOctree<Entity>;
  fallback: Set<Entity>;

  constructor() {
    const extent = WORLD_EXTENT;
    this.octree = new PointOctree(
      new Vector3(-extent, -extent, -extent),
      new Vector3(extent, extent, extent)
    );
    this.fallback = new Set();
  }

  *entitiesInView(frustum: Frustum) {
    for (let entity of this.fallback) {
      const boundingBox: BoundingBox = entity.get(BoundingBox);
      if (
        boundingBox &&
        (frustum.intersectsBox(boundingBox.box) || entity.has(DirectionalLight))
      ) {
        yield entity;
      }
    }
    for (let node of this.octree.leaves(frustum) as any) {
      if (node.data) {
        const { data } = node.data;
        for (let i = 0; i < data.length; i++) {
          const entity = data[i];
          if (entity) {
            const boundingBox: BoundingBox = entity.get(BoundingBox);
            if (boundingBox && frustum.intersectsBox(boundingBox.box)) {
              yield data[i];
            }
          }
        }
      }
    }
  }
}
