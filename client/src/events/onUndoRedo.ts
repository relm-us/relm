import { get } from "svelte/store";
import { worldUIMode } from "~/stores/worldUIMode";
import { worldDoc } from "~/stores/worldDoc";

export function onUndo() {
  if (get(worldUIMode) === "build") {
    get(worldDoc).undoManager.undo();
  } else {
    console.warn("Nothing undone (play mode)");
  }
}

export function onRedo() {
  if (get(worldUIMode) === "build") {
    get(worldDoc).undoManager.redo();
  } else {
    console.warn("Nothing redone (play mode)");
  }
}
