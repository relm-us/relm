import { get } from "svelte/store";
import { worldUIMode } from "~/stores/worldUIMode";
import { worldManager } from "~/world";

export function onUndo() {
  if (get(worldUIMode) === "build") {
    worldManager.worldDoc.undoManager.undo();
  } else {
    console.warn("Nothing undone (play mode)");
  }
}

export function onRedo() {
  if (get(worldUIMode) === "build") {
    worldManager.worldDoc.undoManager.redo();
  } else {
    console.warn("Nothing redone (play mode)");
  }
}
