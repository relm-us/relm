import { get } from "svelte/store";

import { LONG_PRESS_THRESHOLD } from "~/config/constants";
import { keySpace } from "~/stores/keys";

import { globalEvents } from "~/events";

import { registerAction } from "../comboTable";

let pressTimeStart;

export function register() {
  registerAction(["play"], ["space"], (pressed) => {
    // workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1594003
    // TODO: still needed?
    if (pressed && get(keySpace)) return;

    keySpace.set(pressed);

    if (pressed) {
      pressTimeStart = performance.now();
    } else {
      const pressTimeEnd = performance.now();
      const heldTime = pressTimeEnd - pressTimeStart;
      if (heldTime > LONG_PRESS_THRESHOLD) {
        globalEvents.emit("action-long");
      } else {
        globalEvents.emit("action");
      }
    }
  });
}
