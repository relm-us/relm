import { get } from "svelte/store";
import { worldManager } from "~/world";
import { mode } from "~/stores/mode";

export function onSwitchMode(switchTo) {
  if (!switchTo) {
    const $mode = get(mode);
    if ($mode === "play") switchTo = "build";
    else if ($mode === "build") switchTo = "play";
  }

  if (switchTo === "play") {
    mode.set("play");
    worldManager.selection.clear();
    worldManager.avatar.enablePhysics(true);
    worldManager.avatar.enableTranslucency(false);
  } else if (switchTo === "build") {
    mode.set("build");
    worldManager.avatar.enablePhysics(false);
    worldManager.avatar.enableTranslucency(true);
  } else {
    throw new Error(`Unknown mode to switch to: ${switchTo}`);
  }
}
