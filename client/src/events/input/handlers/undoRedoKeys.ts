import { globalEvents } from "~/events";

export function onKeydown(event) {
  if (
    (event.key === "z" && event.ctrlKey) ||
    (event.key === "z" && event.metaKey && !event.shiftKey)
  ) {
    event.preventDefault();

    // "undo" event includes key repetition events
    globalEvents.emit("undo");
  } else if (
    (event.key === "y" && event.ctrlKey) ||
    (event.key === "z" && event.metaKey && event.shiftKey)
  ) {
    event.preventDefault();

    // "redo" event includes key repetition events
    globalEvents.emit("redo");
  }
}

export function onKeyup(event) {}
