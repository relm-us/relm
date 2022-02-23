import * as THREE from "three";
import { PointOctree } from "relm-common/sparse-octree";

import { Entity } from "~/ecs/base";
import {
  BoundingBox,
  Object3DRef,
  SpatiallyIndexed,
  Transform,
} from "./components";
import { Box3, Frustum, PerspectiveCamera, Vector3 } from "three";

const SPATIAL_THRESHOLD = 6;

export class SpatialIndex {
  octree: PointOctree<Entity>;
  fallback: Entity[];

  constructor() {
    const extent = 100;
    this.octree = new PointOctree(
      new THREE.Vector3(-extent, -extent, -extent),
      new THREE.Vector3(extent, extent, extent)
    );
    this.fallback = [];
  }

  // getEntitiesInView(camera: PerspectiveCamera) {
  //   const frustum = new Frustum().setFromProjectionMatrix(
  //     camera.projectionMatrix
  //   );
  //   return this.octree.cull(frustum);
  // }

  getLargestSide(entity: Entity) {
    const boundingBox: BoundingBox = entity.get(BoundingBox);
    return Math.max(boundingBox.size.x, boundingBox.size.y, boundingBox.size.z);
  }

  add(entity: Entity) {
    const side = this.getLargestSide(entity);
    if (side > SPATIAL_THRESHOLD) {
      this.fallback.push(entity);
    } else {
      const transform: Transform = entity.get(Transform);
      this.octree.set(transform.positionWorld, entity);
    }
  }

  move(previous: Vector3, entity: Entity) {
    const found = this.octree.get(previous);
    if (found) {
      const side = this.getLargestSide(entity);
      if (side > SPATIAL_THRESHOLD) {
        this.remove(previous);
        this.fallback.push(entity);
      } else {
        const transform: Transform = entity.get(Transform);
        this.octree.move(previous, transform.positionWorld);
      }
    } else {
      // TODO: check if it's in fallbacks, report if not
    }
  }

  remove(index: Vector3) {
    this.octree.remove(index);
  }
}
