import { get } from "svelte/store";
import { worldManager } from "~/world";

import { selectedEntities } from "~/stores/selection";
import { chatOpen } from "~/stores/chat";
import { worldUIMode } from "~/stores/worldUIMode";
import { playState } from "~/stores";

import { onSwitchMode } from "./onSwitchMode";

export function onEscape() {
  const selected = get(selectedEntities);
  if (get(playState) === "paused") {
    playState.set("playing")
  } else if (selected.size > 0) {
    worldManager.selection.clear();
  } else if (get(chatOpen)) {
    chatOpen.set(false);
  } else if (get(worldUIMode) !== "play") {
    onSwitchMode("play");
  }
}
