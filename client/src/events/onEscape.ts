import { get } from "svelte/store"
import { worldManager } from "~/world"

import { worldUIMode } from "~/stores/worldUIMode"
import { openDialog } from "~/stores/openDialog"
import { selectedEntities } from "~/stores/selection"

import { onSwitchMode } from "./onSwitchMode"

export function onEscape() {
  const selected = get(selectedEntities)
  if (!worldManager.started) {
    worldManager.togglePaused()
  } else if (selected.size > 0) {
    worldManager.selection.clear()
  } else if (get(openDialog) !== null) {
    openDialog.set(null)
  } else if (get(worldUIMode) !== "play") {
    onSwitchMode("play")
  }
}
