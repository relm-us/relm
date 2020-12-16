import { get } from "svelte/store";
import { mode } from "~/stores/mode";

export function onSwitchMode() {
  const $mode = get(mode);
  if ($mode === "build") {
    mode.set("play");
  } else if ($mode === "play") {
    mode.set("build");
  }
}
