import { get } from "svelte/store";
import { worldManager } from "~/stores/worldManager";
import { selectedEntities } from "~/stores/selection";

export function onDelete() {
  const $wm = get(worldManager);
  get(selectedEntities).forEach((entityId) => {
    $wm.wdoc.deleteById(entityId);
  });
}
