import { BASE_LAYER_ID } from "~/config/constants";

import { Entity } from "~/ecs/base";

export function isEntityOnLayer(entity: Entity, layerId: string) {
  return (
    (entity.meta.layerId == null && layerId === BASE_LAYER_ID) ||
    entity.meta.layerId === layerId
  );
}
