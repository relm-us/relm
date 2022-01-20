import { keySpace } from "../store";
import { globalEvents } from "~/events";

export function onKeydown(event) {
  if (event.key === " ") {
    event.preventDefault();

    // "action" event includes key repetition events
    globalEvents.emit("action");

    if (event.repeat) return;

    // We only need to track "first time" key press
    keySpace.set(true);
  }
}

export function onKeyup(event) {
  if (event.key === " ") {
    event.preventDefault();
    keySpace.set(false);
  }
}
