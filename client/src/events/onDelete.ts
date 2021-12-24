import { get } from "svelte/store";
import { selectedEntities } from "~/stores/selection";
import { worldDoc } from "~/stores/worldDoc"

export function onDelete() {
  const $worldDoc = get(worldDoc);
  const $selectedEntities = get(selectedEntities)
  $selectedEntities.forEach((entityId) => {
    $worldDoc.deleteById(entityId);
  });
}
