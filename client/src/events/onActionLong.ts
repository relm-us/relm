import { get } from "svelte/store";

import { worldUIMode } from "~/stores/worldUIMode";

import { InteractorSystem } from "~/ecs/plugins/interactor/systems";
import { Item, Taken } from "~/ecs/plugins/item";

export function onActionLong() {
  if (get(worldUIMode) === "play") {
    const selected = InteractorSystem.selected;
    if (selected && selected.has(Item) && !selected.get(Taken)) {
      selected.add(Taken);
    }
  }
}
