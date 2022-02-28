import { get } from "svelte/store";

import { LONG_PRESS_THRESHOLD } from "~/config/constants";
import { keySpace } from "~/stores/keys";

import { globalEvents } from "~/events";

let pressTimeStart;

export function onKeydown(event) {
  if (event.key === " ") {
    event.preventDefault();

    // We only need to track "first time" key press
    if (event.repeat) return;

    // workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1594003
    if (get(keySpace)) return;

    pressTimeStart = performance.now();

    keySpace.set(true);
  }
}

export function onKeyup(event) {
  if (event.key === " ") {
    event.preventDefault();
    keySpace.set(false);

    const heldTime = performance.now() - pressTimeStart;
    if (heldTime > LONG_PRESS_THRESHOLD) {
      globalEvents.emit("action-long");
    } else {
      globalEvents.emit("action");
    }
  }
}
