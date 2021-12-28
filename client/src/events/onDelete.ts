import { get } from "svelte/store";
import { selectedEntities } from "~/stores/selection";
import { worldManager } from "~/world"

export function onDelete() {
  const $selectedEntities = get(selectedEntities)
  $selectedEntities.forEach((entityId) => {
    worldManager.worldDoc.deleteById(entityId);
  });
}
