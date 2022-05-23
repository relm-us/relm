import { worldManager } from "~/world";

export function onKeydown(event) {
  if (event.key.toLowerCase() === "z") {
    worldManager.dropItem();
  }
}

export function onKeyup(event) {}
