import { get } from "svelte/store";

import { worldUIMode } from "~/stores/worldUIMode";

import { InteractorSystem } from "~/ecs/plugins/interactor/systems";
import { Item2, Taken } from "~/ecs/plugins/item";

export function onActionLong() {
  if (get(worldUIMode) === "play") {
    const selected = InteractorSystem.selected;
    if (selected && selected.has(Item2) && !selected.get(Taken)) {
      selected.add(Taken);
    }
  }
}
