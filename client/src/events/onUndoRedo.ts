import { get } from "svelte/store";
import { Relm } from "~/stores/Relm";
import { mode } from "~/stores/mode";

export function onUndo() {
  if (get(mode) === "build") {
    const $Relm = get(Relm);
    $Relm.wdoc.undoManager.undo();
  } else {
    console.warn("Nothing undone (play mode)");
  }
}

export function onRedo() {
  if (get(mode) === "build") {
    const $Relm = get(Relm);
    $Relm.wdoc.undoManager.redo();
  } else {
    console.warn("Nothing redone (play mode)");
  }
}
