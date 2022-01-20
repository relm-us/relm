import { globalEvents } from "~/events";

export function onKeydown(event) {
  if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();

    // "delete" event includes key repetition events
    globalEvents.emit("delete");
  }
}

export function onKeyup(event) {}
