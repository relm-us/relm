import { get } from "svelte/store";
import { worldManager } from "~/world";
import { selectedEntities } from "~/stores/selection";

export function onDelete() {
  get(selectedEntities).forEach((entityId) => {
    worldManager.wdoc.deleteById(entityId);
  });
}
