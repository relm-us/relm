import { worldManager } from "~/world";
import { selectedEntities, groupTree, GroupTree } from "~/stores/selection";
import { copyBuffer } from "~/stores/copyBuffer";
import {
  getCenter,
  getRootEntities,
  selfWithDescendants,
  serializeEntityWithOffset,
} from "./common";

export function copy() {
  const selectedIds = selectedEntities.get();
  if (selectedIds.size > 0) {
    const entities = [...selectedIds].map((id) =>
      worldManager.world.entities.getById(id)
    );

    // expand selection to include children
    const entitiesWithDescendants = [].concat.apply(
      [],
      entities.map(selfWithDescendants)
    );

    const roots = getRootEntities(entitiesWithDescendants);
    const center = getCenter(roots);

    const serialized = entitiesWithDescendants.map((entity) => {
      if (roots.includes(entity)) {
        return serializeEntityWithOffset(entity, center);
      } else {
        return entity.toJSON();
      }
    });
    copyBuffer.set({
      center,
      entities: serialized,
      groupTree: groupTree.cloneTree(),
    });
  } else {
    console.warn("Nothing copied (nothing selected)");
  }
}
