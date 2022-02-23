import { Presentation } from "~/ecs/plugins/core";
import { BoundingBox } from "~/ecs/plugins/bounding-box";

export function* entitiesInView(this: void, presentation: Presentation) {
  const frustum = presentation.getFrustum();
  for (let entity of presentation.spatial.fallback) {
    const boundingBox: BoundingBox = entity.get(BoundingBox);
    if (frustum.intersectsBox(boundingBox.box)) yield entity;
  }
  for (let node of presentation.spatial.octree.cull(frustum)) {
    const entities = (node as any).data?.data || [];
    for (let entity of entities) {
      const boundingBox: BoundingBox = entity.get(BoundingBox);
      if (frustum.intersectsBox(boundingBox.box)) yield entity;
    }
  }
}
