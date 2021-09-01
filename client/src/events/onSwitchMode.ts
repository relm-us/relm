import { get } from "svelte/store";
import { Relm } from "~/stores/Relm";
import { mode } from "~/stores/mode";

export function onSwitchMode(switchTo) {
  if (!switchTo) {
    const $mode = get(mode);
    if ($mode === "play") switchTo = "build";
    else if ($mode === "build") switchTo = "play";
  }

  const $Relm = get(Relm);

  if (switchTo === "play") {
    mode.set("play");
    $Relm.selection.clear();
    $Relm.avatar.enablePhysics(true);
    $Relm.avatar.enableTranslucency(false);
  } else if (switchTo === "build") {
    mode.set("build");
    $Relm.avatar.enablePhysics(false);
    $Relm.avatar.enableTranslucency(true);
  } else {
    throw new Error(`Unknown mode to switch to: ${switchTo}`);
  }
}
