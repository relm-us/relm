import { get } from "svelte/store";
import { worldManager } from "~/world";
import { mode } from "~/stores/mode";

export function onUndo() {
  if (get(mode) === "build") {
    worldManager.wdoc.undoManager.undo();
  } else {
    console.warn("Nothing undone (play mode)");
  }
}

export function onRedo() {
  if (get(mode) === "build") {
    worldManager.wdoc.undoManager.redo();
  } else {
    console.warn("Nothing redone (play mode)");
  }
}
