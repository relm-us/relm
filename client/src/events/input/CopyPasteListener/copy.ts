import { worldManager } from "~/world";
import { selectedEntities, groupTree, GroupTree } from "~/stores/selection";
import { copyBuffer } from "~/stores/copyBuffer";
import {
  CopyBuffer,
  getCenter,
  getRootEntities,
  selfWithDescendants,
  serializeCopyBuffer,
  serializeEntityWithOffset,
} from "./common";

export function copy(clipboardData?: DataTransfer) {
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

    const serializedEntities = entitiesWithDescendants.map((entity) => {
      if (roots.includes(entity)) {
        return serializeEntityWithOffset(entity, center);
      } else {
        return entity.toJSON();
      }
    });

    // after serializing with center, move center to accommodate pos of participant
    center.y -= worldManager.participants.local.avatar.position.y;

    const buffer: CopyBuffer = {
      center,
      entities: serializedEntities,
      groupTree: groupTree.cloneTree(),
    };
    copyBuffer.set(buffer);

    if (clipboardData) {
      const clipboard = "relm:" + serializeCopyBuffer(buffer);
      clipboardData.setData("text/plain", clipboard);

      // Let caller preventDefault on event
      return true;
    }
  } else {
    console.warn("Nothing copied (nothing selected)");
  }
}
