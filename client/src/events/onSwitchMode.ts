import { get } from "svelte/store";

import { permits } from "~/stores/permits";
import { worldManager } from "~/world";
import { worldUIMode } from "~/stores/worldUIMode";

export function onSwitchMode(switchTo) {
  const buildModePermitted = get(permits).includes("edit");

  if (!switchTo) {
    const $mode = get(worldUIMode);
    if ($mode === "play") switchTo = "build";
    else if ($mode === "build") switchTo = "play";
  }

  if (switchTo === "play") {
    worldUIMode.set("play");
    worldManager.selection.clear();
    worldManager.avatar.enableTranslucency(false);
  } else if (switchTo === "build" && buildModePermitted) {
    worldUIMode.set("build");
    worldManager.avatar.enableTranslucency(true);
  } else {
    throw new Error(`Unknown mode to switch to: ${switchTo}`);
  }
}
