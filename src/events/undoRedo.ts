import { get } from "svelte/store";
import { mode } from "~/stores/mode";
import { worldManager } from "~/stores/worldManager";

export function onUndo() {
  if (get(mode) === "build") {
    const $wm = get(worldManager);
    $wm.wdoc.undoManager.undo();
  } else {
    console.warn("Nothing undone (play mode)");
  }
}

export function onRedo() {
  if (get(mode) === "build") {
    const $wm = get(worldManager);
    $wm.wdoc.undoManager.redo();
  } else {
    console.warn("Nothing redone (play mode)");
  }
}
