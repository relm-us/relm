import { globalEvents } from "~/events";

export function onKeydown(event) {
  if (event.key === "Escape") {
    // "delete" event includes key repetition events
    globalEvents.emit("escape");
  }
}

export function onKeyup(event) {}
