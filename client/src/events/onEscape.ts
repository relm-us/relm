import { get } from "svelte/store";
import { worldManager } from "~/world";

import { selectedEntities } from "~/stores/selection";
import { chatOpen } from "~/stores/chat";
import { worldUIMode } from "~/stores/worldUIMode";

import { onSwitchMode } from "./onSwitchMode";

export function onEscape() {
  const selected = get(selectedEntities);
  if (!worldManager.started) {
    worldManager.start();
  } else if (selected.size > 0) {
    worldManager.selection.clear();
  } else if (get(chatOpen)) {
    chatOpen.set(false);
  } else if (get(worldUIMode) !== "play") {
    onSwitchMode("play");
  }
}
