import { get } from "svelte/store";
import { worldManager } from "~/stores/worldManager";
import { selectedEntities } from "~/stores/selection";

export function onDelete() {
  const $wm = get(worldManager);
  get(selectedEntities).forEach((entityId) => {
    const entity = $wm.world.entities.getById(entityId);
    $wm.wdoc.delete(entity);
  });
}
