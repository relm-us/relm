import { get } from "svelte/store";
import { mode } from "~/stores/mode";
import { worldManager } from "~/stores/worldManager";

export function onSwitchMode(switchTo) {
  console.log("switchTo", switchTo);

  if (!switchTo) {
    const $mode = get(mode);
    if ($mode === "play") switchTo = "build";
    else if ($mode === "build") switchTo = "play";
  }

  const $wm = get(worldManager);

  if (switchTo === "play") {
    mode.set("play");
    $wm.selection.clear();
    $wm.enablePhysics();
  } else if (switchTo === "build") {
    mode.set("build");
    $wm.disablePhysics();
  } else {
    throw new Error(`Unknown mode to switch to: ${switchTo}`);
  }
}
