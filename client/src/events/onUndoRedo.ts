import { get } from "svelte/store";
import { mode } from "~/stores/mode";
import { worldDoc } from "~/stores/worldDoc";

export function onUndo() {
  if (get(mode) === "build") {
    get(worldDoc).undoManager.undo();
  } else {
    console.warn("Nothing undone (play mode)");
  }
}

export function onRedo() {
  if (get(mode) === "build") {
    get(worldDoc).undoManager.redo();
  } else {
    console.warn("Nothing redone (play mode)");
  }
}
