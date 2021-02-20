import { get } from "svelte/store";
import { Relm } from "~/stores/Relm";
import { selectedEntities } from "~/stores/selection";

export function onDelete() {
  const $Relm = get(Relm);
  get(selectedEntities).forEach((entityId) => {
    $Relm.wdoc.deleteById(entityId);
  });
}
