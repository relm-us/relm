import { get } from "svelte/store";

import { worldUIMode } from "~/stores/worldUIMode";

import { InteractorSystem } from "~/ecs/plugins/interactor/systems";
import { Clickable, Clicked } from "~/ecs/plugins/clickable";
import { worldManager } from "~/world";

export function onAction() {
  // TODO: prevent action when in whiteboard mode; new worldUIMode === "document"?
  if (get(worldUIMode) === "play") {
    const selected = InteractorSystem.selected;
    if (selected && selected.has(Clickable) && !selected.has(Clicked)) {
      selected.add(Clicked);
    } else if (worldManager.inventory.actionable()) {
      worldManager.inventory.action();
    }
  }
}
