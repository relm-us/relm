import { get } from "svelte/store";
import { mode } from "~/stores/mode";
import { selectedEntities } from "~/stores/selection";

export function onSwitchMode() {
  const $mode = get(mode);
  if ($mode === "build") {
    selectedEntities.clear();
    mode.set("play");
  } else if ($mode === "play") {
    mode.set("build");
  }
}
