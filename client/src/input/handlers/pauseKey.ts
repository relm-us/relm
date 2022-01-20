import { globalEvents } from "~/events";

export function onKeydown(event) {
  if (event.key.toLowerCase() === "p") {
    globalEvents.emit("toggle-pause");
  }
}

export function onKeyup(event) {}
