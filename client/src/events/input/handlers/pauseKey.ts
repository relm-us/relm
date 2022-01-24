import { worldManager } from "~/world";

export function onKeydown(event) {
  if (event.key.toLowerCase() === "p") {
    worldManager.togglePaused();
  }
}

export function onKeyup(event) {}
