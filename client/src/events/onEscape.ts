import { get } from "svelte/store";
import { worldManager } from "~/world";
import { selectedEntities } from "~/stores/selection";
import { chatOpen } from "~/stores/chatOpen";
import { mode } from "~/stores/mode";
import { onSwitchMode } from "./onSwitchMode";

export function onEscape() {
  const selected = get(selectedEntities);
  if (selected.size > 0) {
    worldManager.selection.clear();
  } else if (get(chatOpen)) {
    chatOpen.set(false);
  } else if (get(mode) !== "play") {
    onSwitchMode("play");
  }
}
