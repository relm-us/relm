import { get } from "svelte/store";

import { worldUIMode } from "~/stores/worldUIMode";

import { InteractorSystem } from "~/ecs/plugins/interactor/systems";
import { Clickable, Clicked } from "~/ecs/plugins/clickable";

export function onAction() {
  if (get(worldUIMode) === "play") {
    const selected = InteractorSystem.selected;
    if (selected && selected.get(Clickable) && !selected.get(Clicked)) {
      selected.add(Clicked);
    }
  }
}
