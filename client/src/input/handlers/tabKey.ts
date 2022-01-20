import { globalEvents } from "~/events";

export function onKeydown(event) {
  if (event.key === "Tab") {
    event.preventDefault();

    globalEvents.emit("switch-mode");
  }
}

export function onKeyup(event) {}
